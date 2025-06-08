from rest_framework import viewsets, permissions
from .models import Question
from .serializers import QuestionSerializer

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple ViewSet for listing or retrieving questions.
    Question creation is handled by the 'generate_questions' action in SourceViewSet.
    """
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny] # Or configure as needed

    def get_queryset(self):
        """
        Optionally restricts the returned questions,
        e.g., to questions belonging to a specific source if a 'source_id' query param is provided.
        """
        queryset = Question.objects.all().order_by('-created_at')
        source_id = self.request.query_params.get('source_id')
        if source_id is not None:
            queryset = queryset.filter(source_id=source_id)
        return queryset
