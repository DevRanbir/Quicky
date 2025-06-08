from rest_framework import serializers
from .models import Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'source', 'question_text', 'options', 'correct_answer', 'explanation', 'page_number', 'created_at']
        read_only_fields = ['id', 'created_at']  # Removed 'source' from here