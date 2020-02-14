from django.contrib import admin
from django.urls import path, include
from catalog import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('blog/', include('blog.urls')),
    path('user/', include('users.urls')),
    path('path_not_found_404', views.ERR404),
    path('subscriptions/', include('subscriptions.urls')),
    path('', include('catalog.urls')),
]
