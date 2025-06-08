from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(['GET'])
def wake_up_view(request):
    return JsonResponse({'status': 'Backend is awake!'})