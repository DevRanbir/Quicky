from django.urls import path, include

urlpatterns = [
    path('api/sources/', include('sources.urls')),
    path('api/questions/', include('questions.urls')),
    path('api/', include('content_generation.urls')),  # Add the new content generation endpoints
]