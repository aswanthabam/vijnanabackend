from rest_framework import serializers, validators
from db.models import CustomUser
import uuid

class UserSerializer(serializers.Serializer):
  user_id = serializers.ReadOnlyField()
  first_name = serializers.CharField(required=True)
  second_name = serializers.CharField(required=True)
  email = serializers.CharField(required=True,validators=[validators.UniqueValidator(queryset=CustomUser.objects.all())])
  phone = serializers.CharField(required=True)
  
  
  def create(self,validated_data):
    validated_data['user_id'] = uuid.uuid4()
    user = CustomUser(**validated_data)
    return user

  class Meta:
    model = CustomUser
    fields = [
      'user_id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'college',
      'course',
      'year'
    ]