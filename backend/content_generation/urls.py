from django.urls import path
from . import views

urlpatterns = [
    path('generate-content/', views.generate_content, name='generate-content'),
]