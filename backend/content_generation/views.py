import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import groq

@api_view(['POST'])
def generate_content(request):
    """Generate content using Groq API based on the provided title."""
    try:
        title = request.data.get('title')
        if not title:
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize Groq client
        groq_client = groq.Groq(api_key=os.getenv('GROQ_API_KEY'))

        # Generate content using Groq
        prompt = f"Generate comprehensive educational content about {title}. The content should be detailed, well-structured, and suitable for creating quiz questions. Include detailed key concepts but do not make any quiz Questions, also make sure you do not use markdown."

        completion = groq_client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": prompt
            }],
            model="meta-llama/llama-4-scout-17b-16e-instruct",  # Using Mixtral model for better content generation
            temperature=0.7,
            max_tokens=2000,
        )

        # Extract the generated content
        generated_content = completion.choices[0].message.content

        return Response({
            'content': generated_content
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to generate content: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )