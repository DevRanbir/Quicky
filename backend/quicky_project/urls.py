from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from sources import views 


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/sources/', include('sources.urls')),
    path('api/sources/<int:source_id>/preview/', views.source_preview, name='source_preview'),
    path('api/questions/', include('questions.urls')),  # Add this line
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)