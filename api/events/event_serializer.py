from rest_framework import serializers, validators
from rest_framework.fields import empty
from db.models import Event
import uuid

class EventSerializer(serializers.ModelSerializer):
  event_id = serializers.ReadOnlyField()
  name = serializers.CharField(required=True)
  description = serializers.CharField(required=True)
  link = serializers.CharField(required=True)
  img = serializers.CharField(required=True)
  details = serializers.CharField(required=True)
  documents = serializers.CharField(required=True)

  def create(self, validated_data):
    validated_data['event_id'] = validated_data.get('name').lower().replace(' ','')
    event = Event(**validated_data)
    event.save()
    return event
  
  class Meta:
    model = Event
    fields = [
      'event_id',
      'name',
      'description',
      'link',
      'img',
      'details',
      'documents',
      'date',
      'venue',
      'poster',
      'is_open'
    ]

class EventEditSerializer(serializers.ModelSerializer):
  
  def update(self, instance, validated_data):
    instance.name = validated_data.get('name',instance.name)
    instance.description = validated_data.get('description',instance.description)
    instance.link = validated_data.get('link')
    instance.img = validated_data.get('img',instance.img)
    instance.details = validated_data.get('details',instance.details)
    instance.documents = validated_data.get('documents',instance.documents)

    instance.save()
    return instance
  class Meta:
    model = Event
    fields = [
      'name',
      'description',
      'link',
      'img',
      'details',
      'documents'
    ]