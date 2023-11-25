from rest_framework.views import APIView
from rest_framework.response import Response
from . import event_serializer
from utils.utils import CustomResponce
from db.models import Event

class EventView(APIView):
  def get(self,request):
    try:
        event_id = request.GET.get('event_id')
        if event_id:
            objs = Event.objects.filter(event_id=event_id)
        else:
            objs = Event.objects.all()
        evn = event_serializer.EventSerializer(instance=objs,many=True)
        # evn.is_valid()
        return CustomResponce(data=evn.data).get_success_responce()
    except Exception as e:
      print(e)
      return CustomResponce('An Unexpected issue occured. Please contact us!').get_failiure_responce(status=500)

  def post(self,request):
    try:
      print("Creating event..")
      evn = event_serializer.EventSerializer(data=request.data)
      if evn.is_valid():
        evn.save()
        return CustomResponce("Successfully created event!",data=evn.validated_data).get_success_responce()
      else:
        return CustomResponce("Invalid request!",data=evn.errors).get_failiure_responce()
    except Exception as e:
      print(e)
      return CustomResponce('An Unexpected issue occured. Please contact us!').get_failiure_responce(status=500)

  def patch(self, request):
    try:
        event_id = request.data.get('event_id')
        if event_id:
            event = Event.objects.filter(event_id=event_id).first()
            if event is not None:
                evn = event_serializer.EventEditSerializer(event, data=request.data, partial=True)
                if evn.is_valid():
                    evn.save()
                    return CustomResponce("Successfully edited event!", data=evn.validated_data).get_success_responce()
                else:
                    return CustomResponce("Invalid request!", data=evn.errors).get_failiure_responce()
            else:
                return CustomResponce('Event not found!').get_failiure_responce()
        else:
            return CustomResponce('Invalid event id!').get_failiure_responce()
    except Exception as e:
        print(e)
        return CustomResponce('An Unexpected issue occurred. Please contact us!').get_failiure_responce(status=500)
  
  def delete(self, request):
    try:
        event_id = request.data.get('event_id')
        if event_id:
            event = Event.objects.filter(event_id=event_id).first()
            if event is not None:
                event.delete()
                return CustomResponce(f"Event Deleted ({event.name})!").get_success_responce()
            else:
                return CustomResponce('Event not found!').get_failiure_responce()
        else:
            return CustomResponce('Invalid event id!').get_failiure_responce()
    except Exception as e:
        print(e)
        return CustomResponce('An Unexpected issue occurred. Please contact us!').get_failiure_responce(status=500)
