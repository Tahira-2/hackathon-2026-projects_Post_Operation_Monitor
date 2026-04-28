from django.contrib import admin
from django.urls import path, include

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static

schema_view = get_schema_view(
   openapi.Info(
      title="Navjeevan API",
      default_version='v1',
      description="Navjeevan API description",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Swagger UI
    path(
            "",
            schema_view.with_ui('swagger', cache_timeout=0),              
            name='schema-swagger-ui'
    ),
    path(
        "redoc/",
        schema_view.with_ui('redoc', cache_timeout=0),
        name='schema-redoc'
    ),

    # Admin site
    path('admin/', admin.site.urls),
    path('api/auth/', include('user.urls')),
    path('api/vaccines/', include('vaccine_tracker.urls')),
    path('', include("visualisation.urls")),
    path ('', include('event.urls')),
    # Local Apps
]
