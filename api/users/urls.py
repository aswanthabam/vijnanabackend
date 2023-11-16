from django.contrib import admin
from django.urls import path, include
from . import user_views
urlpatterns = [
    path('register/',user_views.RegisterView.as_view())
]
