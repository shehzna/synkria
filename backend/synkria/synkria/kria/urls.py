from django.contrib import admin
from django.urls import path
from . import views
from . import api_views
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('',views.home,name="home"),
    path('login/',views.signin,name="login"),
    path('register/',views.register,name="register"),
    path('signout/',views.signout,name="signout"),
    
    # JWT API endpoints
    path('api/auth/login/', api_views.login_view, name='api-login'),
    path('api/auth/register/', api_views.register_view, name='api-register'),
    path('api/auth/logout/', api_views.logout_view, name='api-logout'),
    path('api/auth/profile/', api_views.user_profile, name='api-profile'),
    path('api/auth/token/refresh/', api_views.token_refresh, name='token-refresh'),
    path('api/auth/health/', api_views.health_check, name='api-health'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

