from django.contrib import admin
from django.urls import path, include
from . import event_views
urlpatterns = [
    path('',event_views.EventView.as_view()),
    path('create/',event_views.EventView.as_view()),
    path('update/',event_views.EventView.as_view()),
    path('delete/',event_views.EventView.as_view())
]
