 
using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq.Expressions;      
using System.Text.Json;
 
 
namespace CalendarAppProject {
 
 
public class CalendarApp
{
    static List<CalendarEvent> events = new();
    static int reminderPeriod = 7;
   
    public static void Main(string[] args)
{
    bool continueLoop = true;
    LoadEvents();
 
    while (continueLoop)
    {
        try
        {
            Console.WriteLine("----Welcome to the Calendar!----");
            Console.WriteLine($"Today is: {DateTime.Now:dd/MM/yyyy}");
            Console.WriteLine("----Calendar Menu----");
            Console.WriteLine("1. Event Manager");
            Console.WriteLine("2. View Monthly Calendar");
            Console.WriteLine("3. Set Reminders");
            Console.WriteLine("4. Exit");
 
            int choice = Convert.ToInt32(Console.ReadLine()); 
            switch (choice)
            {
                case 1:
                    EventManager();
                    break;
                case 2:
                    ViewCalendar();
                    break;
                case 3:
                    ReminderManager();
                    break;
                case 4:
                    Console.WriteLine("Exiting...");
                    DisplayRemindersBeforeExit();
                    continueLoop = false;
                    break;
                default:
                    Console.WriteLine("Wrong Input! Please enter a valid option.");
                    break;
            }
        }
        catch (FormatException ex)
        {
            Console.WriteLine($"Invalid input. Please enter a valid number. Error: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred: {ex.Message}");
        }
    }
}
 
static void DisplayRemindersBeforeExit()
{
    DateTime currentDate = DateTime.Now.Date;
    int reminderPeriod = 7; 
    DateTime reminderDate = currentDate.AddDays(reminderPeriod);
 
    List<CalendarEvent> upcomingEvents = events.Where(e => e.Date >= currentDate && e.Date <= reminderDate).ToList();
 
    if (upcomingEvents.Count > 0)
    {
        Console.WriteLine($"\nUpcoming Events in the next {reminderPeriod} days:");
        foreach (var ev in upcomingEvents)  
        {
            Console.WriteLine($"- {ev.Date:yyyy-MM-dd}: {ev.Description}");
        }
    }
    else
    {
        Console.WriteLine($"\nNo events in the next {reminderPeriod} days.");
    }
}
 
 
        static void EventManager()
        {
            bool continueLoop = true;
            while(continueLoop == true)
            {
                try
                {
                    Console.WriteLine("1. Add Event");
                    Console.WriteLine("2. View Event");
                    Console.WriteLine("3. Delete Event");
                    Console.WriteLine("4. Change Event"); 
                    Console.WriteLine("5. Back To Main Menu");
 
 
                    int choice = Convert.ToInt32(Console.ReadLine());
 
                    switch(choice)
                    {
                        case 1:
                            AddEvent();
                        break;
                        case 2:
                            ViewEventsForDate();
                        break;
                        case 3:
                            DeleteEvent();
                        break;
                        case 4:
                            ChangeEvent();
                        break;
                        case 5:
                            Console.WriteLine("Exiting...");
                            continueLoop = false;
                        break;
                        default:
                            Console.WriteLine("Wrong Input");
                        break;
                    }
                }catch(Exception e)
                {
                    Console.WriteLine("invalid input, " + e.Message);
                }
            }
        }
 
 
 
 
   static void ViewCalendar()
{
    Console.Write("Enter date (yyyy-MM): ");
    if (DateTime.TryParse(Console.ReadLine(), out DateTime date)) 
    {
        int year = date.Year;
        int month = date.Month;

        DisplayCalendar(year, month);
    }
    else
    {
        Console.WriteLine("Invalid date format.");
    }
}

static void DisplayCalendar(int year, int month)
{
    Console.Clear();
    Console.WriteLine($"Calendar for {month}/{year}\n");
    Console.WriteLine("Mon Tue Wed Thu Fri Sat Sun");

    DateTime firstDay = new DateTime(year, month, 1);
    int daysInMonth = DateTime.DaysInMonth(year, month);

    int startDay = ((int)firstDay.DayOfWeek + 6) % 7;  

    for (int i = 0; i < startDay; i++)
    {
        Console.Write("    "); 
    }

    for (int day = 1; day <= daysInMonth; day++)
    {
        DateTime currentDay = new DateTime(year, month, day);
        string dayString = GetDateWithEventMarker(currentDay); 

        Console.Write($"{dayString,3} "); 

        if ((startDay + day) % 7 == 0)
        {
            Console.WriteLine();
        }
    }
    Console.WriteLine();
}

static string GetDateWithEventMarker(DateTime date)
{
    foreach (var eventItem in events)
    {
        if (eventItem.Date.Date == date.Date)
        {
            return date.Day.ToString() + " *"; 
        }
    }
    return date.Day.ToString(); 
}

 
static void AddEvent()
{
    while (true) 
    {
        try
        {
            Console.Write("Enter date (yyyy-MM-dd): ");
            string? dateInput = Console.ReadLine(); 
            if (DateTime.TryParse(dateInput, out DateTime date)) 
            {
                Console.Write("Enter event name: ");
                string? description = Console.ReadLine(); 
 
                if (string.IsNullOrEmpty(description)) 
                {
                    Console.WriteLine("Event name cannot be empty, please try again.");
                    continue; 
                }
 
                
                events.Add(new CalendarEvent { Date = date, Description = description });
 
                Console.WriteLine("Event added successfully!");
                break; 
            }
            else
            {
                Console.WriteLine("Invalid date format, please try again.");
            }
        }
        catch (FormatException e)
        {
            Console.WriteLine($"Error: {e.Message}. Please try again.");
        }
    }
}
 
 
       
        static void DeleteEvent()
        {
        while(true)
        {
            Console.Write("Enter date to view events for deletion (yyyy-MM-dd): ");
            if (DateTime.TryParse(Console.ReadLine(), out DateTime date))
            {
                var eventsForDate = events.FindAll(e => e.Date.Date == date.Date);
 
                if (eventsForDate.Count == 0)
                {
                    Console.WriteLine("No events found for this date.");
                    return;
                }
 
                Console.WriteLine($"Events on {date.ToShortDateString()}:");
                for (int i = 0; i < eventsForDate.Count; i++)
                {
                    Console.WriteLine($"{i + 1}. {eventsForDate[i].Description}");
                }
 
                Console.Write("Enter the number of the event to delete: ");
                if (int.TryParse(Console.ReadLine(), out int choice) && choice >= 1 && choice <= eventsForDate.Count)
                {
                    var eventToDelete = eventsForDate[choice - 1];
                    events.Remove(eventToDelete);
 
                    Console.WriteLine("Event deleted successfully!");
                    SaveEvents(); 
                    break;
                }
                else
                {
                    Console.WriteLine("Invalid choice.");
                }
            }
            else
            {
                Console.WriteLine("Invalid date format.");
            }
        }
        }
 
        static void ChangeEvent()
{
    while (true) 
    {
        Console.Write("Enter date to view events for modification (yyyy-MM-dd): ");
        if (DateTime.TryParse(Console.ReadLine(), out DateTime date))
        {
            var eventsForDate = events.FindAll(e => e.Date.Date == date.Date);
 
            if (eventsForDate.Count == 0)
            {
                Console.WriteLine("No events found for this date.");
                return; 
            }
 
            Console.WriteLine($"Events on {date.ToShortDateString()}:");
            for (int i = 0; i < eventsForDate.Count; i++)
            {
                Console.WriteLine($"{i + 1}. {eventsForDate[i].Description}");
            }
 
            Console.Write("Enter the number of the event to change: ");
            if (int.TryParse(Console.ReadLine(), out int choice) && choice >= 1 && choice <= eventsForDate.Count)
            {
                var eventToChange = eventsForDate[choice - 1];
 
                Console.WriteLine("1. Change Date");
                Console.WriteLine("2. Change Name");
                Console.WriteLine("3. Change Both");
                Console.Write("Enter your choice: ");
                if (int.TryParse(Console.ReadLine(), out int changeOption))
                {
                    bool validChange = false;
 
                    if (changeOption == 1 || changeOption == 3)
                    {
                        while (!validChange)
                        {
                            Console.Write("Enter new date (yyyy-MM-dd): ");
                            if (DateTime.TryParse(Console.ReadLine(), out DateTime newDate))
                            {
                                
                                if (events.Any(e => e.Date.Date == newDate.Date))
                                {
                                    Console.WriteLine("There is already an event on this date. Please choose another date.");
                                }
                                else
                                {
                                    eventToChange.Date = newDate;
                                    validChange = true; 
                                }
                            }
                            else
                            {
                                Console.WriteLine("Invalid date format, please try again.");
                            }
                        }
                    }
 
                    if (changeOption == 2 || changeOption == 3)
                    {
                        while (true) 
                        {
                            Console.Write("Enter new Name: ");
                            string? newDescription = Console.ReadLine();
                            if (!string.IsNullOrWhiteSpace(newDescription))
                            {
                                eventToChange.Description = newDescription;
                                break; 
                            }
                            else
                            {
                                Console.WriteLine("Description cannot be empty. Please try again.");
                            }
                        }
                    }
 
                    Console.WriteLine("Event updated successfully!");
                    SaveEvents();
                    break; 
                }
                else
                {
                    Console.WriteLine("Invalid choice. Please select a valid option.");
                }
            }
            else
            {
                Console.WriteLine("Invalid choice. Please select a valid event number.");
            }
        }
        else
        {
            Console.WriteLine("Invalid date format. Please enter a valid date (yyyy-MM-dd).");
        }
    }
}
 
 
 
 
 
 
 
static void ViewEventsForDate()
{
    while (true)
    {
        Console.Write("Enter date to view events (yyyy-MM-dd): ");
        if (DateTime.TryParse(Console.ReadLine(), out DateTime date))
        {
            var eventsForDate = events.FindAll(e => e.Date.Date == date.Date);
 
            if (eventsForDate.Count == 0)
            {
                Console.WriteLine("No events found for this date.");
                break; 
            }
            else
            {
                Console.WriteLine($"Events on {date.ToShortDateString()}:");
                foreach (var calendarEvent in eventsForDate)
                {
                    Console.WriteLine($"- {calendarEvent.Description}"); 
                }
                break; 
            }
        }
        else
        {
            Console.WriteLine("Invalid date format, please try again.");
        }
    }
}
 
 
        static void ReminderManager()
        {
            Console.Write("Enter custom reminder period in days (or press Enter for default 7 days): ");
            string? input = Console.ReadLine();
            if (!string.IsNullOrWhiteSpace(input) && int.TryParse(input, out int customPeriod))
            {
                reminderPeriod = customPeriod;
            }
 
            DateTime currentDate = DateTime.Now.Date;
            DateTime reminderDate = currentDate.AddDays(reminderPeriod);
 
            var upcomingEvents = events.Where(e => e.Date >= currentDate && e.Date <= reminderDate).ToList();
 
            if (upcomingEvents.Count > 0)
            {
                Console.WriteLine($"\nUpcoming Events in the next {reminderPeriod} days:");
                foreach (var ev in upcomingEvents)
                {
                    Console.WriteLine($"- {ev.Date:yyyy-MM-dd}: {ev.Description}");
                }
            }
            else
            {
                Console.WriteLine($"\nNo events in the next {reminderPeriod} days.");
            }
        }

        //  JSON CODE
 
        static void LoadEvents()
        {
            try
            {
                if(File.Exists("events.json"))
                {
                    string json = File.ReadAllText("events.json");
                    events = JsonSerializer.Deserialize<List<CalendarEvent>>(json) ?? new List<CalendarEvent>();
                    Console.WriteLine(events);
                }else {
                    File.Create("events.json");
                    events = new List<CalendarEvent>();
                    Console.WriteLine("Created");
                }
            }
            catch(Exception e)
            {
                Console.WriteLine($"Error loading events: {e.Message}");
                events = new List<CalendarEvent>();
            }
        }
 
        static void SaveEvents()
        {
            try{
                string json = JsonSerializer.Serialize(events,new JsonSerializerOptions{ WriteIndented = true });
                File.WriteAllText("events.json",json);
                }catch (Exception e)
                {
                    Console.WriteLine($"Error saving events: {e.Message}");
                }
        }
 
 
 
 
 
 
 
    }
    }
 
 
