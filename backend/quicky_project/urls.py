from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from sources import views 

from django.urls import reverse
from django.http import HttpResponse

def debug_urls(request):
    from django.urls import get_resolver
    resolver = get_resolver()
    url_patterns = []
    
    def collect_urls(patterns, prefix=''):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                collect_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            else:
                url_patterns.append(prefix + str(pattern.pattern))
    
    collect_urls(resolver.url_patterns)
    return HttpResponse('<br>'.join(url_patterns))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/sources/', include('sources.urls')),
    path('api/sources/<int:source_id>/preview/', views.source_preview, name='source_preview'),
    path('api/questions/', include('questions.urls')),  # Add this line
    path('api/content_generation/', include('content_generation.urls')), 
    path('api/wakeUP/', include('wakeUP.urls')),
    path('debug-urls/', debug_urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)