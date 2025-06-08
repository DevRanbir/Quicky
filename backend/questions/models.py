from django.db import models
from sources.models import Source

class Question(models.Model):
    source = models.ForeignKey(Source, related_name='questions', on_delete=models.CASCADE)
    question_text = models.TextField()
    # Storing options as JSON for flexibility (e.g., multiple choice, true/false)
    # Example for multiple choice: {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}
    # Example for true/false: {"True": "True", "False": "False"}
    options = models.JSONField()
    # Correct answer could be the key of the correct option, e.g., "A" or "True"
    correct_answer = models.CharField(max_length=255) 
    # Optional: Explanation for the answer
    explanation = models.TextField(blank=True, null=True)
    page_number = models.IntegerField(blank=True, null=True) # Page number from which the question was generated
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Q: {self.question_text[:50]}... (Source: {self.source.id})"