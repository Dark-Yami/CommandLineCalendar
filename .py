import calendar
from datetime import datetime
#import os
#import json
events={}
def Display(month,year):
  print("\n", calendar.month(month,year))
  for day in range(1, calendar.monthrange(month,year)[1]+1):
    convertedDate=(f"{month} {year} {day}")
  if convertedDate in events:
    print(f"  {day:2} -> Events: {', '.join(events[convertedDate].keys())}")
 
def eventManager():
  event_managed=input("Enter the date  in the format of Day/Month/Year: ")
  try:
    datetime.strptime(event_managed,"%d %m %Y")
  except ValueError:
    print("Invalid date input")
  return
actionButton=input("What would you like to do? \n 1. Add an event \n 2. Delete an event \n 3. Edit an event")
if actionButton=="1":
  nameOfEvent=input("Type the name of the event: ")
  if event_managed not in events:
    events[event_managed]={}
  events[event_managed]=nameOfEvent
  print("Event added")
elif actionButton=="2":
  event_managed=input("Type the name of the event: ")
  if event_managed in events:
    del events[event_managed]
    print("Event deleted")
  else:
    print("Event not found")
elif actionButton=="3" :
    event_managed=input("Type the name of the event: ")
    if event_managed in events:
      new_name=input("Enter the new name of the event: ")
      events[event_managed]=new_name_event
