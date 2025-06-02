from .models import Question, Source
from .serializers import QuestionSerializer
import groq
import json
import os
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
groq_api_key = os.getenv('GROQ_API_KEY')
groq_client = groq.Client(api_key=groq_api_key)

def parse_page_ranges(pages_str):
    """Parses a page string like "1-3,5,7-8" into a list of page numbers (0-indexed)."""
    if not pages_str:
        return []
    pages_to_generate = set()
    try:
        ranges = pages_str.split(',')
        for r in ranges:
            r = r.strip()  # Remove whitespace
            if '-' in r:
                start, end = map(int, r.split('-'))
                # Convert to 0-indexed pages - Fixed the range to be inclusive of end page
                pages_to_generate.update(range(start - 1, end))  # This was correct, end is exclusive in range()
            else:
                # Convert to 0-indexed page
                pages_to_generate.add(int(r) - 1)
    except ValueError:
        # Handle invalid page string format gracefully
        print(f"Warning: Invalid page range string format: {pages_str}")
        return []
    return sorted(list(pages_to_generate))

def clean_json_response(response_content):
    """Clean common JSON formatting issues from AI responses."""
    # Remove any text before the first [ and after the last ]
    json_match = re.search(r'\[\s*{.*}\s*\]', response_content, re.DOTALL)
    if json_match:
        response_content = json_match.group(0)
    
    # Clean up common issues
    response_content = response_content.strip()
    
    # Remove trailing commas before closing braces and brackets
    response_content = re.sub(r',(\s*[}\]])', r'\1', response_content)
    
    # Fix spacing issues
    response_content = re.sub(r'\s+', ' ', response_content)
    response_content = response_content.replace('{ ', '{').replace(' }', '}')
    response_content = response_content.replace('[ ', '[').replace(' ]', ']')
    
    return response_content

def validate_question_structure(question):
    """Validate that a question has the required structure."""
    required_fields = ['question_text', 'options', 'correct_answer', 'explanation']
    
    if not isinstance(question, dict):
        return False, "Question is not a dictionary"
    
    for field in required_fields:
        if field not in question:
            return False, f"Missing required field: {field}"
    
    # Validate options structure
    if not isinstance(question['options'], dict):
        return False, "Options must be a dictionary"
    
    expected_options = {'A', 'B', 'C', 'D'}
    if set(question['options'].keys()) != expected_options:
        return False, f"Options must have keys A, B, C, D. Got: {list(question['options'].keys())}"
    
    # Validate correct_answer
    if question['correct_answer'] not in expected_options:
        return False, f"Correct answer must be A, B, C, or D. Got: {question['correct_answer']}"
    
    # Validate that all text fields are non-empty strings
    text_fields = ['question_text', 'explanation']
    for field in text_fields:
        if not isinstance(question[field], str) or not question[field].strip():
            return False, f"Field {field} must be a non-empty string"
    
    # Validate that all options are non-empty strings
    for key, value in question['options'].items():
        if not isinstance(value, str) or not value.strip():
            return False, f"Option {key} must be a non-empty string"
    
    return True, "Valid"

def generate_questions_batch(text_content, num_questions, source_id, source_type, batch_number=None):
    """
    Generate a batch of questions from text content.
    Returns a list of valid question dictionaries.
    """
    
    # Limit text length to prevent overwhelming the AI
    max_text_length = 3000
    if len(text_content) > max_text_length:
        text_content = text_content[:max_text_length] + "..."
        print(f"Info: Truncated text for {source_type} source to {max_text_length} characters")

    # Log generation attempt
    batch_info = f" (batch {batch_number})" if batch_number else ""
    print(f"Generating exactly {num_questions} questions for {source_type} source {source_id}{batch_info} using Groq API.")
    
    # Enhanced prompt with better constraints
    prompt = f"""
You are an expert question generator. Based on the following text, generate EXACTLY {num_questions} multiple-choice questions.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY {num_questions} questions - NO MORE, NO LESS
2. Each question must have EXACTLY 4 options labeled A, B, C, and D
3. Each question must have exactly one correct answer (A, B, C, or D)
4. Each question must include a brief explanation
5. Questions should test comprehension, analysis, or key facts from the text
6. Avoid questions that are too obvious or too obscure
7. Make sure incorrect options are plausible but clearly wrong
8. Do not generate duplicate questions
9. Avoid What is the output of the program type questions if there is no code in your question

RESPONSE FORMAT REQUIREMENTS:
- Return ONLY a valid JSON array
- No additional text, no markdown formatting, no code blocks
- No explanatory text before or after the JSON

Example format (generate {num_questions} questions like this):
[
    {{
        "question_text": "What is the main topic discussed in the text?",
        "options": {{
            "A": "First option",
            "B": "Second option", 
            "C": "Third option",
            "D": "Fourth option"
        }},
        "correct_answer": "B",
        "explanation": "The text clearly states that the main topic is about the second option, as mentioned in paragraph 2."
    }}
]

TEXT TO ANALYZE:
{text_content}

Generate exactly {num_questions} questions in valid JSON format:
"""
    
    max_retries = 3
    generated_questions = None
    
    for attempt in range(max_retries):
        try:
            # Call Groq API with more conservative settings
            completion = groq_client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "system", 
                        "content": f"You are an expert question generator. You MUST generate exactly {num_questions} multiple-choice questions in valid JSON format. Each question must have exactly 4 options (A, B, C, D) and one correct answer. Return only valid JSON array, no other text."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,  # Lower temperature for more consistent output
                max_tokens=2000,  # Adequate for the required number of questions
                top_p=0.9,
                stream=False
            )
            
            # Extract the generated questions from the response
            response_content = completion.choices[0].message.content.strip()
            
            # Clean the JSON response
            response_content = clean_json_response(response_content)
            
            # Parse the JSON response
            try:
                generated_questions = json.loads(response_content)
                
                # Validate that it's a list
                if not isinstance(generated_questions, list):
                    raise ValueError(f"Expected list, got {type(generated_questions)}")
                
                # Validate each question structure
                valid_questions = []
                for i, question in enumerate(generated_questions):
                    is_valid, error_msg = validate_question_structure(question)
                    if is_valid:
                        valid_questions.append(question)
                    else:
                        print(f"Warning: Question {i+1} for {source_type} source{batch_info} is invalid: {error_msg}")
                
                generated_questions = valid_questions
                
                # Check if we got the expected number of questions
                if len(generated_questions) != num_questions:
                    print(f"Warning: Expected {num_questions} questions, got {len(generated_questions)} valid questions for {source_type} source{batch_info} (attempt {attempt + 1})")
                    
                    # If we got fewer questions than expected and this isn't the last attempt, retry
                    if len(generated_questions) < num_questions and attempt < max_retries - 1:
                        print(f"Retrying to get exactly {num_questions} questions...")
                        continue
                
                if generated_questions:  # If we have at least some valid questions
                    break
                else:
                    raise ValueError("No valid questions generated")
                    
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed for {source_type} source{batch_info}, attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    print(f"Raw response: {response_content[:500]}...")  # Limit output
                continue
            except ValueError as e:
                print(f"Question validation failed for {source_type} source{batch_info}, attempt {attempt + 1}: {str(e)}")
                continue
                
        except Exception as e:
            print(f"Error generating questions for {source_type} source{batch_info}, attempt {attempt + 1}: {str(e)}")
            if attempt == max_retries - 1:
                print(f"Failed to generate questions for {source_type} source{batch_info} after {max_retries} attempts")
            continue
    
    return generated_questions if generated_questions else []

def generate_questions_from_text_content(*, source_text_content=None, questions_per_page=None, pages_to_generate_str=None, total_question_limit=None, source_id=None):
    """
    Generates questions from the given text_content using the Groq API with llama-4-scout model.
    source_text_content: List of strings (text per page for PDF, list with one string for others).
    questions_per_page: Max number of questions to generate per selected page.
    pages_to_generate_str: Optional string indicating page ranges (e.g., "1-3,5"). For non-PDFs, this is ignored.
    total_question_limit: Optional overall limit on questions.
    source_id: The ID of the source object.
    Returns a list of created Question objects (serialized).
    """
    
    # Validate required parameters
    if not source_text_content or not isinstance(source_text_content, list):
        print("Error: source_text_content must be a non-empty list")
        return []
    
    if source_id is None:
        print("Error: source_id is required")
        return []
    
    if questions_per_page is None or questions_per_page <= 0:
        print("Error: questions_per_page must be a positive integer")
        return []
    
    # Ensure questions_per_page is reasonable (between 1 and 15)
    if questions_per_page > 15:
        print(f"Warning: questions_per_page is set to {questions_per_page}, which is unusually high. Limiting to 15.")
        questions_per_page = 15
    
    # Get the source object to determine type
    try:
        source = Source.objects.get(id=source_id)
    except Source.DoesNotExist:
        print(f"Error: Source with id {source_id} not found")
        return []
    
    # DELETE EXISTING QUESTIONS FOR THIS SOURCE BEFORE GENERATING NEW ONES
    try:
        existing_questions = Question.objects.filter(source_id=source_id)
        existing_count = existing_questions.count()
        if existing_count > 0:
            print(f"Found {existing_count} existing questions for source {source_id}. Deleting them...")
            existing_questions.delete()
            print(f"Successfully deleted {existing_count} existing questions")
        else:
            print(f"No existing questions found for source {source_id}")
    except Exception as e:
        print(f"Error deleting existing questions for source {source_id}: {str(e)}")
        # You might want to return here if deletion fails, or continue with generation
        # return []  # Uncomment this line if you want to stop generation when deletion fails
    
    all_questions_data = []
    actual_pages_processed = 0

    # Handle PDF files (existing logic unchanged)
    if source.source_type == 'PDF':
        # Determine which pages to process
        if pages_to_generate_str:
            pages_indices = parse_page_ranges(pages_to_generate_str)
            if not pages_indices:
                print(f"Warning: No valid pages to process from string '{pages_to_generate_str}' for PDF source {source.id}. Processing all available content.")
                pages_indices = list(range(len(source_text_content)))
            else:
                # Validate page indices against available content length
                valid_pages_indices = [p for p in pages_indices if 0 <= p < len(source_text_content)]
                if len(valid_pages_indices) != len(pages_indices):
                    print(f"Warning: Some page numbers in '{pages_to_generate_str}' are out of bounds for PDF source {source.id} (total pages: {len(source_text_content)}). Processing valid pages only.")
                pages_indices = valid_pages_indices
                if not pages_indices:
                    print(f"Warning: All specified pages in '{pages_to_generate_str}' were invalid for PDF source {source.id}. Processing all available content.")
                    pages_indices = list(range(len(source_text_content)))
        else:
            # No specific pages, process all
            pages_indices = list(range(len(source_text_content)))
        
        print(f"PDF source {source.id}: Processing pages {[p+1 for p in pages_indices]} (total available: {len(source_text_content)})")

        # Process each selected page for PDF
        for page_index in pages_indices:
            # Check if we've reached the total question limit before processing this page
            if total_question_limit is not None and len(all_questions_data) >= total_question_limit:
                print(f"Reached total question limit of {total_question_limit}. Stopping generation.")
                break

            if page_index < 0 or page_index >= len(source_text_content):
                print(f"Warning: Page index {page_index + 1} is out of bounds for source {source.id}. Skipping.")
                continue

            page_text = source_text_content[page_index]
            if not page_text or not page_text.strip():
                print(f"Info: Page {page_index + 1} of source {source.id} is empty or has no text. Skipping question generation for this page.")
                continue
            
            # Calculate how many questions to request for this specific page
            questions_remaining = None
            if total_question_limit is not None:
                questions_remaining = total_question_limit - len(all_questions_data)
                if questions_remaining <= 0:
                    print(f"Total question limit reached. Stopping generation.")
                    break
            
            # Determine number of questions to request for this page
            num_to_request_this_iteration = min(
                questions_per_page,
                questions_remaining if questions_remaining is not None else questions_per_page
            )

            if num_to_request_this_iteration <= 0:
                continue

            # Generate questions for this page
            generated_questions = generate_questions_batch(
                page_text, 
                num_to_request_this_iteration, 
                source_id, 
                source.source_type
            )
            
            # Add generated questions to collection
            if generated_questions:
                questions_added_this_page = 0
                for question in generated_questions:
                    # Check total limit before adding each question
                    if total_question_limit is not None and len(all_questions_data) >= total_question_limit:
                        print(f"Reached total question limit of {total_question_limit} while processing page {page_index + 1}")
                        break
                        
                    question["source"] = source_id
                    question["page_number"] = page_index + 1  # Store 1-indexed page number
                    
                    all_questions_data.append(question)
                    questions_added_this_page += 1
                
                print(f"Successfully added {questions_added_this_page} questions from page {page_index + 1}")
                actual_pages_processed += 1
            else:
                print(f"Failed to generate any valid questions for page {page_index + 1}")

    else:
        # Handle non-PDF files (YOUTUBE, TXT, PPTX, DOCX, etc.) with batching
        if pages_to_generate_str:
            print(f"Info: Page selection '{pages_to_generate_str}' is ignored for {source.source_type} source type. Processing entire content.")
        
        # For non-PDF files, use the first (and typically only) item in source_text_content
        content_text = source_text_content[0] if source_text_content else ""
        
        if not content_text or not content_text.strip():
            print(f"Info: Content of {source.source_type} source {source.id} is empty or has no text. Skipping question generation.")
            return []
        
        # Calculate total questions to generate
        total_questions_to_generate = total_question_limit if total_question_limit is not None else questions_per_page
        
        print(f"Processing {source.source_type} source {source.id}: Generating {total_questions_to_generate} total questions")
        
        # If total questions <= 15, generate in single batch
        if total_questions_to_generate <= 15:
            generated_questions = generate_questions_batch(
                content_text, 
                total_questions_to_generate, 
                source_id, 
                source.source_type
            )
            
            if generated_questions:
                for question in generated_questions:
                    question["source"] = source_id
                    question["page_number"] = 1  # Non-PDF files are treated as single page
                    all_questions_data.append(question)
                
                print(f"Successfully added {len(generated_questions)} questions from {source.source_type} source")
                actual_pages_processed = 1
            else:
                print(f"Failed to generate any valid questions for {source.source_type} source")
        
        else:
            # If total questions > 15, divide into batches of 15
            batch_size = 15
            total_batches = (total_questions_to_generate + batch_size - 1) // batch_size  # Ceiling division
            
            print(f"Generating {total_questions_to_generate} questions in {total_batches} batches of {batch_size}")
            
            for batch_num in range(total_batches):
                # Calculate questions for this batch
                questions_remaining = total_questions_to_generate - len(all_questions_data)
                questions_for_this_batch = min(batch_size, questions_remaining)
                
                if questions_for_this_batch <= 0:
                    break
                
                # Generate batch
                generated_questions = generate_questions_batch(
                    content_text, 
                    questions_for_this_batch, 
                    source_id, 
                    source.source_type,
                    batch_num + 1
                )
                
                if generated_questions:
                    questions_added_this_batch = 0
                    for question in generated_questions:
                        if len(all_questions_data) >= total_questions_to_generate:
                            break
                            
                        question["source"] = source_id
                        question["page_number"] = 1  # Non-PDF files are treated as single page
                        all_questions_data.append(question)
                        questions_added_this_batch += 1
                    
                    print(f"Successfully added {questions_added_this_batch} questions from batch {batch_num + 1}")
                else:
                    print(f"Failed to generate questions for batch {batch_num + 1}")
            
            if all_questions_data:
                actual_pages_processed = 1
                print(f"Successfully generated {len(all_questions_data)} total questions across {total_batches} batches")

    # Log summary
    if source.source_type == 'PDF':
        print(f"SUMMARY: Successfully processed {actual_pages_processed} pages, generated {len(all_questions_data)} total questions")
        print(f"Selected pages were: {[p+1 for p in pages_indices]}")
        print(f"Questions per page requested: {questions_per_page}")
        if total_question_limit:
            print(f"Total question limit: {total_question_limit}")
    else:
        print(f"SUMMARY: Successfully processed {source.source_type} source, generated {len(all_questions_data)} questions")
        if total_question_limit and total_question_limit > 15:
            print(f"Used batching approach for {total_question_limit} questions")

    # Serialize and save questions
    if all_questions_data:
        print(f"DEBUG: About to serialize {len(all_questions_data)} questions")
        
        serializer = QuestionSerializer(data=all_questions_data, many=True)
        if serializer.is_valid():
            serializer.save() # This will create the Question objects
            print(f"SUCCESS: Created {len(serializer.data)} questions in database")
            return serializer.data # Return serialized data of created questions
        else:
            print(f"ERROR: Failed to serialize questions: {serializer.errors}")
            # Print detailed error info for debugging
            for i, error in enumerate(serializer.errors):
                if error:
                    print(f"Question {i} errors: {error}")
                    if i < len(all_questions_data):
                        print(f"Question {i} data: {all_questions_data[i]}")
            return [] # Return empty list on serialization error
    else:
        print("No questions were generated")
    
    return [] # Return empty list if no questions were generated