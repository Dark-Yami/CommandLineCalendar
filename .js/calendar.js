const fs = require("fs");
const readline = require("readline");
const { json } = require("stream/consumers");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function checkDate(date) {
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormat.test(date)) {
        console.log("Invalid format. Please enter a date in format(YYYY-MM-DD).");
        return false;
        
    }
    try {
        const [year, month, day] = date.split("-").map(Number);
        const realDate = new Date(year, month - 1, day);
        const today = new Date();
        if (today.setHours(0,0,0,0) <= realDate.setHours(0,0,0,0)) {
            return (realDate.getFullYear() === year && realDate.getMonth() === month - 1 && realDate.getDate() === day);
        }
        else {
            console.log("Invalid input. The date has already passed.")
            return false;
        }
        
    }
    catch (error) {
        console.log("Invalid input. Please enter an existing date in format(YYYY-MM-DD).", error.message);
        return false;
    }
}

function isValidNumber(number) {
    const num = Number(number);
    if (num <= 0 || isNaN(num) || !Number.isInteger(num)) {
        return false;
    }
    return true;
}

function viewCalendar(month, year){
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const firstDay = (new Date(year, month-1, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month, 0).getDate();
    let calendar = "";
    const events = loadEvents();
    let eventDates = events.map(event => new Date(event["Date: "]))
                           .filter(eventDate => eventDate.getMonth() === Number(month)-1 && eventDate.getFullYear() === Number(year))
                           .map(eventDate => eventDate.getDate());
    for(let day=0; day < firstDay; day++) {
        calendar += "    ";
    }
    for(let day=1; day <=totalDays; day++) {
        let isEvent = eventDates.includes(day);
        calendar += isEvent ? `*${String(day).padStart(2)} ` : `${String(day).padStart(2)}  `;
        if((firstDay + day)%7===0){
            calendar += "\n";
        }
    }
    console.log("------" + months[Number(month)-1] + ", " + year + "------");
    console.log(daysOfWeek.join(" "));
    console.log(calendar);
}

function loadEvents() {
    if(!fs.existsSync("events.json")) {
        fs.writeFileSync("events.json", JSON.stringify([]));
    }
    try {
        const events = fs.readFileSync("events.json", "utf8");
        return events.trim() ? JSON.parse(events) : [];
    }
    catch (error) {
        console.error('Error occured reading events data file.', error.message)
        return [];
    }
}

function saveEvents(events) {
    if(!fs.existsSync("events.json")) {
        fs.writeFileSync("events.json", JSON.stringify([]));
    }
    try {
        fs.writeFileSync("events.json", JSON.stringify(events, null, 2));
        return true;
    }
    catch (error) {
        console.log("Error occured while saving events.", error.message);
        return false;
    }
}

function addEvent(date, event) {
    let newEvent = {"Date: ":date, "Event: ":event};
    const events = loadEvents();
    events.push(newEvent);
    saveEvents(events);
    if (saveEvents(events)) {
        console.log("Event added.");
    }
    
}

function viewEvents() {
    const events = loadEvents();
    if (events.length === 0) {
        console.log("No events recorded.");
    }
    else {
        events.forEach((event, index) => {
            console.log(`${index + 1}. ${event["Date: "]} : ${event["Event: "]}`);
        });
    }
}
    
function editEvent(eventNum, newDate, newEvent) {
    let index = eventNum-1;
    const events = loadEvents();
        if (index >= 0 && index-1 < events.length) {
            events[index] = {"Date: ":newDate, "Event: ":newEvent};
            saveEvents(events);
            if (saveEvents(events)) {
                console.log("Event edited.");
            }
        }
        else {
            console.log("Invalid input. Please enter the number infront of event you want to change.");
        }
}

function deleteEvent(eventNum) {
    const events = loadEvents();
    let index = eventNum - 1;
    if (index >= 0 && index < events.length) {
        events.splice(index, 1);
        saveEvents(events);
        if (saveEvents(events)) {
            console.log("Event deleted.");
        }
    }
    else {
        console.log(`Event number ${eventNum} doesn't exist. Please enter valid number.`);
    }
}

function saveReminders(reminders) {
    if (!fs.existsSync("reminders.json")) {
        fs.writeFileSync("reminders.json", JSON.stringify([])); 
    }
    try {
        fs.writeFileSync("reminders.json", JSON.stringify(reminders, null, 2));
        return true;
    }
    catch (error) {
        console.log("Error occured while saving reminders.", error.message);
        return false;
    }
}

function setReminder(event, period) { 
    const index = event - 1;
    const events = loadEvents();
    const reminders = loadReminders(); 
    let today = new Date();
    if (index >= 0 && index < events.length) {
        let target = new Date(events[index]["Date: "]);
        let eventDescription = events[index]["Event: "];
        if (today <= target) {
            const daysUntilEvent = Math.ceil((target.getTime() - today.getTime()) / (1000*60*60*24)); 
            if (daysUntilEvent >= period) {
                let reminder = {
                    event: eventDescription,
                    date: events[index]["Date: "],
                    remindOn: new Date(target.getTime() - period*1000*60*60*24).toISOString().split("T")[0],
                };
                const existingIndex = reminders.findIndex((existingReminder) => 
                    reminder.event === existingReminder.event && reminder.date === existingReminder.date)
                if (existingIndex !== -1) {
                    rl.question("You already have reminder set for that event. Do you want to change it? (y/n):", (answer) => {
                        answer.toLowerCase();
                        if (answer === "y") {
                            reminders[existingIndex] = reminder;
                            saveReminders(reminders);
                            if (saveReminders(reminders)) {
                                console.log(`Reminder for ${eventDescription} is set.`);
                            }
                            displayMenu();
                        }
                        else {
                            displayMenu();
                        }
                    });
                }
                else {
                    reminders.push(reminder);
                    saveReminders(reminders);
                    if (saveReminders(reminders)) {
                        console.log(`Reminder for ${eventDescription} is set.`);
                    }
                    displayMenu();
                }
            }
            else {
                console.log(`Impossible to set reminder in the past. It's ${daysUntilEvent} days until the event.`);
                displayMenu();
            }
        }
        else {
            console.log("The event has already passed.")
            displayMenu();
        }
    }
    else if (events.length === 0) {
        console.log("Please add the event first.");
        displayMenu();
    }
    else {
        console.log(`Event number ${event} doesn't exist. Please enter valid number.`);
        displayMenu();
    }
}

function displayReminders() {
    const reminders = loadReminders();
    const events = loadEvents();
    const today = new Date();
    if (reminders.length > 0) {
        const upcomingReminders = reminders.filter(reminder => {
            const remindDate = new Date(reminder.remindOn);
            return remindDate.getTime() <= today.getTime();
        });
        if (upcomingReminders.length > 0) {
            upcomingReminders.forEach(reminder => {
                events.forEach(upcomingEvent => {
                    if (reminder.date === upcomingEvent["Date: "] && reminder.event === upcomingEvent["Event: "]) {
                        const remindDate = new Date(reminder.remindOn);
                        const eventDate = new Date(reminder.date);
                        if (remindDate.getTime() <= today.getTime()) {
                            const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000*60*60*24));
                            if (daysUntil > 0) {
                                console.log(`Reminder: it's ${daysUntil} days until ${reminder.event}.`);
                            }
                            else if (daysUntil === 0) {
                                console.log(`Reminder: ${reminder.event} is today!`);
                            }
                            else {
                                const index = reminders.indexOf(reminder);
                                reminders.splice(index, 1);
                                saveReminders(reminders);
                            }
                        }
                    }
                });
                
            });
        }
    }
}

function loadReminders() {
    if(!fs.existsSync("reminders.json")) {
        fs.writeFileSync("reminders.json", JSON.stringify([]));
    }
    try {
        const reminders = fs.readFileSync("reminders.json", "utf8");
        return reminders.trim() ? JSON.parse(reminders) : [];
    }
    catch (error) {
        console.error('Error occured reading reminders data file.', error.message)
        return [];
    }
}

function displayMenu(){
    console.log("----Calendar Menu----");
    console.log("1. View Monthly Calendar");
    console.log("2. Event Manager");
    console.log("3. Set reminder");
    console.log("4. Exit");
    rl.question("Choose an option: ", (option) => {
        switch(option) {
            case "1":
                rl.question("Enter the month and year (MM-YYYY):", (input) => {
                    try {
                        let [month, year] = input.includes("-") ? input.split("-") : input.split(" ");
                        if ((month < 1 || month > 12) || (year < 1000 || year > 9999)) {
                            console.log("Invalid input. Please enter an existing date in format (MM-YYYY).");
                            displayMenu();
                        }
                        else {
                            viewCalendar(month, year);
                            displayMenu();
                        }
                    }
                    catch (error) {
                        console.log("Invalid input. Please enter a valid month and year in format(MM-YYYY).");
                        displayMenu();
                    }
                });
                break;
            case "2":
                console.log("Welcome to Event Manager!");
                console.log("1. Add Event");
                console.log("2. View Events");
                console.log("3. Edit Event");
                console.log("4. Delete Event");
                console.log("5. Back to Main Menu");
                rl.question("Choose an option: ", (option) => {
                    switch(option) {
                        case "1":
                            rl.question("Event date (YYYY-MM-DD): ", (date) => {
                                if (checkDate(date)) {
                                    rl.question("Event description: ", (event) => {
                                    addEvent(date, event);
                                    displayMenu();
                                    });
                                }
                                else {
                                    console.log("Invalid input. Please enter an existing date.");
                                    displayMenu();
                                }
                            }); 
                            break;
                        case "2":
                            viewEvents();   
                            displayMenu();
                            break;
                        case "3":
                            viewEvents();
                            const events = loadEvents();
                            if (events.length === 0) {
                                displayMenu();
                            }
                            else {
                                rl.question("Which event do you want to edit (enter a number): ", (num) => {
                                    if (!isValidNumber(num)) {
                                        console.log("Invalid input. Please enter a valid event number.");
                                        displayMenu();
                                    }
                                    else {
                                        if (num > 0 && num <= events.length) {
                                            rl.question("Event date (YYYY-MM-DD): ", (newDate) => {
                                                if (checkDate(newDate)) {
                                                    rl.question("Event description: ", (newEvent) => {
                                                    editEvent(Number(num), newDate, newEvent);
                                                    displayMenu();
                                                    });
                                                }
                                                else {
                                                    displayMenu();
                                                }
                                            });
                                        }
                                        else {
                                            console.log("Invalid input. Please enter an existing date.");
                                            displayMenu();
                                        }
                                    }
                                    
                                });
                            }
                            break;
                        case "4":
                            viewEvents();
                            const allEvents = loadEvents();
                            if (allEvents.length === 0) {
                                displayMenu();
                            }
                            else {
                                rl.question("Which event do you want to delete (enter a number): ", (num) => {
                                    if (!isValidNumber(num)) {
                                        console.log("Invalid input. Please enter a valid event number.");
                                        displayMenu();
                                    }
                                    else {
                                        deleteEvent(num);
                                        displayMenu();
                                    }
                                });
                            }
                            break;
                        case "5":
                            displayMenu();
                            break;
                        default:
                            console.log("Invalid input. Please enter a number between 1-5.");
                            displayMenu();
                            break;
                    }
                });
                break;
            case "3":
                viewEvents();
                const events = loadEvents();
                if (events.length > 0) {
                    rl.question("Choose the event to set reminder for (enter a number): ", (event) => {
                        if (!isValidNumber(event)) {
                            console.log("Invalid input. Please enter a valid event number.");
                            displayMenu();
                        }
                        else {
                            if (event > events.length) {
                                console.log(`Invalid input. That event doesn't exist.`);
                                displayMenu();
                            }
                            else {
                                rl.question("How many days before you want to get reminded: ", (period) => {
                                    if (!isValidNumber(period)) {
                                        console.log("Invalid input. Please enter a valid number.");
                                        displayMenu();
                                    }
                                    else {
                                        setReminder(event, period);
                                    }
                                });
                            }
                        }
                    });
                }
                else {
                    displayMenu();
                }
                break;
            case "4":
                displayReminders();
                console.log("Goodbye!");
                rl.close();
                break;
            default:
                console.log("Invalid input. Please enter a number 1-4.");
                displayMenu();
                break;
        }
    });
}
console.log("----Welcome to the Calendar!----");
const todaysDate = new Date();
console.log(`Today is ${todaysDate.getDate()}.${todaysDate.getMonth()+1}.${todaysDate.getFullYear()}.`);
displayMenu();