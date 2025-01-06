import calendar
from datetime import datetime, timedelta
import json
import os

EVENTS_FILE = 'events.json'

events = {}

def load_events():
    global events
    if os.path.exists(EVENTS_FILE):
        try:
            with open(EVENTS_FILE, 'r') as file:
                events = json.load(file)
        except json.JSONDecodeError:
            print(f"Error: {EVENTS_FILE} contains invalid JSON.")
            events = {}  

def save_events():
    with open(EVENTS_FILE, 'w') as file:
        json.dump(events, file, indent=4)
def Display(month, year):
    cal = calendar.TextCalendar()
    first_day, num_days = calendar.monthrange(year, month)

   
    print(f"{calendar.month_name[month]} {year}".center(20))
    print("Mo Tu We Th Fr Sa Su")  
    day_list = ["   "] * first_day  
    for day in range(1, num_days + 1):
        date_key = f"{year}-{month:02d}-{day:02d}"
        if date_key in events:
            day_str=f"{day:2}*"
        else:
           day_str=f"{day:2} "
        day_list.append(day_str)

    for week_start in range(0, len(day_list), 7):
        week = day_list[week_start:week_start + 7]
        print("".join(week))

    for day in range(1, num_days + 1):
        date_key = f"{year}-{month:02d}-{day:02d}"
        if date_key in events:
            print(f"  {day:2} -> Events: {', '.join(events[date_key].keys())}")


def setReminder():
    if not events:
        print("No events available to set a reminder.")
        return

    print("Select the event to set a reminder:")
    event_list = []
    event_count = 1

    for date, event_details in sorted(events.items()):
        for event_name in event_details.keys():
            print(f"{event_count}. {event_name} on {date}")
            event_list.append((date, event_name))
            event_count += 1

    try:
        event_choice = int(input("Enter the number of the event you want to set a reminder for: "))
        if event_choice < 1 or event_choice > len(event_list):
            raise ValueError("Invalid choice.")

        selected_event = event_list[event_choice - 1]
        date = selected_event[0]
        event_name = selected_event[1]

        today = datetime.now().date()
        event_date = datetime.strptime(date, "%Y-%m-%d").date()
        if event_date < today:
            raise ValueError(f"Cannot set a reminder for an event on {date} because it is a past date.")

        days_until_event = (event_date - today).days
        print(f"The event is in {days_until_event} day(s).")

       
        default_reminder = event_date - timedelta(days=1)
        reminder_input = input(f"Do you want to set up a custom reminder y/n Default: [{default_reminder.strftime('%Y-%m-%d')}] ")
        if reminder_input.lower() == 'y':
            leftover = int(input(f"Set reminder time for event '{event_name}' on {date} (maximum {days_until_event - 1} day(s) before the event): "))
            if leftover >= days_until_event:
                raise ValueError(f"Reminder cannot be set for more than {days_until_event - 1} day(s) before the event.")
            reminder_time = event_date - timedelta(days=leftover)
            print("Custom reminder set")
        else:
            reminder_time = default_reminder

        if "reminders" not in events[date][event_name]:
            events[date][event_name]["reminders"] = []

        events[date][event_name]["reminders"].append(reminder_time.strftime('%Y-%m-%d'))
        save_events() 
        print(f"Reminder set successfully for '{event_name}'")

    except (ValueError, IndexError) as e:
        print(f"Error: {e}")

def reminders_soon():
    today = datetime.now().date()
    soon = today + timedelta(days=7)
    upcoming = []

    for date, event_details in sorted(events.items()):
        for event_name, details in event_details.items():
            if "reminders" in details:
                for reminder in details["reminders"]:
                    try:
                        reminder_date = datetime.strptime(reminder, "%Y-%m-%d").date()
                        if today <= reminder_date <= soon:
                            upcoming.append(f"Event: {event_name} on date: {date} - reminder: {reminder}")
                    except ValueError:
                        print(f"Invalid reminder format: {reminder}")

    if upcoming:
        print("\nUpcoming events in the next seven days:")
        for event in upcoming:
            print(event)
    else:
        print("No events in the next seven days")


def eventManager():
    actionButton = input(
        "What would you like to do? \n1. Add an event \n2. Delete an event \n3. Edit an event \n4. View all events \n5. Return to main menu: "
    )
    if actionButton == "4":
        vievEvents()
        return
    if actionButton == "5":
        return
    today = datetime.now().date()

    if actionButton == "1":
        event_managed = input("Enter the date in the format of year-month-day: ")
        try:
            event_date = datetime.strptime(event_managed, "%Y-%m-%d").date()
            if event_date < today:
                raise ValueError
        except ValueError:
            print("Invalid date input or event is in past.")
            return

        nameOfEvent = input("Type the name of the event: ")
        if event_managed not in events:
            events[event_managed] = {}
        save_events()
        print("Event added successfully!")

    elif actionButton == "2":
      deleteEvent()

    elif actionButton == "3":
        event_name = input("Type the name of the event to edit: ")
        if event_managed in events and event_name in events[event_managed]:
            new_name = input("Enter the new name of the event: ")
            del events[event_managed][event_name]
            save_events() 
            print("Event updated successfully!")
        else:
            print("Event not found!")

def vievEvents():
    if not events:
        print("Events not found")
    else:
        event_count = 1
        for date, event_details in sorted(events.items()):
            print(f"Date: {date}")
            for event_name, details in event_details.items():
                print(f"  {event_count}. {event_name}" )
                event_count += 1
def deleteEvent():
    if not events:
        print("No events available to delete.")
        return

    print("Select the event to delete: ")
    event_list = []
    event_count = 1

    for date, event_details in sorted(events.items()):
        for event_name in event_details.keys():
            print(f"{event_count}. {event_name} on {date}")
            event_list.append((date, event_name))
            event_count += 1

    try:
        event_choice = int(input("Enter the number of the event you want to delete: "))
        if event_choice < 1 or event_choice > len(event_list):
            raise ValueError("Invalid choice.")

        selected_event = event_list[event_choice - 1]
        date = selected_event[0]
        event_name = selected_event[1]

        del events[date][event_name]
        if not events[date]: 
            del events[date]

        save_events()
        print(f"Event '{event_name}' on {date} deleted successfully!")

    except (ValueError, IndexError) as e:
        print(f"Error: {e}")

def main():
    """Main function to display the menu and handle user choices."""
    load_events() 
    today = datetime.now()
    print("----Welcome to the Calendar!----")
    print(f"Today is {today.day}-{today.month}-{today.year}")
    print("----Calendar Menu----")
    while True:
        print("\n1. View Monthly Calendar\n2. Event Manager\n3. Set reminder\n4. Exit")
        choice = input("Choose one of the options above: ")
        if choice == "1":
            try:
                month = int(input("Enter the month (1-12): "))
                if month < 1 or month > 12:
                    raise ValueError("Invalid month")
                year = int(input("Enter the year: "))
                Display(month, year)
            except ValueError:
                print("Invalid input! Please enter numeric values for month and year.")
        elif choice == "2":
            eventManager()
        elif choice == "3":
            setReminder()
        elif choice == "4":
            print("Checking for  reminders before exiting...")
            reminders_soon()
            print("Exiting the calendar.")
            break
        else:
            print("Invalid choice! Please try again.")

if __name__ == "__main__":
    main()
