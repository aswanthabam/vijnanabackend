from rest_framework.views import APIView
from rest_framework.response import Response
from . import user_serializer

class RegisterView(APIView):
  def get(self,request):
    try:
      res = user_serializer.UserSerializer(data=request.data)
      # if res.is_valid():
      #   return Response({})
      # else:return Response({})
    except Exception as e:
      print(e)