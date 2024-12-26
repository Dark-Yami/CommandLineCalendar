// JS prva verzija
const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function viewCalendar(month, year){
    const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const firstDay = (new Date(year, month-1, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month, 0).getDate();
    let calendar = "";
    for(let i=0; i<firstDay; i++) {
        calendar += "    ";
    }
    for(let i=1; i <=totalDays;i++) {
        calendar += String(i).padStart(2, " ") + "  ";
        if((firstDay + i)%7===0){
            calendar += "\n";
        }
    }
    console.log(months[Number(month)] + ", " + year);
    console.log(daysOfWeek.join(" "));
    console.log(calendar);
}

function displayMenu(){
    console.log("Welcome to the Calendar!");
    console.log("1. View Monthly Calendar");
    console.log("2. Event Manager");
    console.log("3. Set reminder");
    console.log("4. Exit");
    rl.question("Choose an option: ", (option) => {
        switch(option) {
            case "1":
                rl.question("Enter the month and year (MM/YYYY):", (input) => {
                    let month = input.slice(0,2);
                    month = Number(month);
                    let year = input.slice(-4);
                    viewCalendar(month, year);
                    displayMenu();
                });
                break;
            case "2":
                console.log("Welcome to Event Manager!");
                console.log("1. Add Event");
                console.log("2. View Event");
                console.log("3. Edit Event");
                console.log("4. Delete Event");
                console.log("5. Back to Main Menu");
                rl.question("Choose an option: ", (option) => {
                    switch(option) {
                        case "1":
                            //addEvent();
                            displayMenu();
                            break;
                        case "2":
                            //viewEvent();
                            displayMenu();
                            break;
                        case "3":
                            //editEvent();
                            displayMenu();
                            break;
                        case "4":
                            //deleteEvent();
                            displayMenu();
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
                //setReminder();
                displayMenu();
                break;
            case "4":
                console.log("Goodbye!");
                break;
            default:
                console.log("Invalid input. Please enter a number 1-4.");
                displayMenu();
                break;
        }
    });
}

displayMenu();