from rest_framework import serializers
from db.models import CustomUser
import uuid

class UserSerializer(serializers.Serializer):
  user_id = serializers.ReadOnlyField()
  
  def create(self,validated_data):
    validated_data['user_id'] = uuid.uuid4()
    user = CustomUser(**validated_data)
    return user

  class Meta:
    model = CustomUser
    fields = [
      'user_id',
      'first_name',
      'second_name',
      'email',
      'phone',
      'college',
      'course',
      'year'
    ]