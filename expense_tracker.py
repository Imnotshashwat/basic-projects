# This program demonstrates file I/O, using a dictionary to store data, and user interaction.

import os

# Define the file name to store expenses
EXPENSE_FILE = "expenses.txt"

def load_expenses():
    """Loads expenses from the file into a dictionary."""
    expenses = {}
    if os.path.exists(EXPENSE_FILE):
        with open(EXPENSE_FILE, 'r') as f:
            for line in f:
                # Split the line by the colon to get the category and amount
                category, amount = line.strip().split(':')
                expenses[category] = float(amount)
    return expenses

def save_expenses(expenses):
    """Saves expenses from the dictionary to the file."""
    with open(EXPENSE_FILE, 'w') as f:
        for category, amount in expenses.items():
            f.write(f"{category}:{amount}\n")

def add_expense(expenses):
    """Adds a new expense."""
    category = input("Enter expense category (e.g., Food, Transport): ").strip().capitalize()
    try:
        amount = float(input("Enter amount spent: "))
        if amount <= 0:
            print("Amount must be a positive number.")
            return
        
        # Add the amount to the existing category or create a new one
        expenses[category] = expenses.get(category, 0) + amount
        print(f"Expense '{category}' of {amount} added successfully!")
    except ValueError:
        print("Invalid amount. Please enter a number.")

def view_expenses(expenses):
    """Displays a summary of all expenses."""
    if not expenses:
        print("No expenses recorded yet.")
        return
    
    print("\n--- Your Expenses Summary ---")
    total_expenses = 0
    for category, amount in expenses.items():
        print(f"{category}: ${amount:.2f}")
        total_expenses += amount
    print(f"--------------------------")
    print(f"Total: ${total_expenses:.2f}")
    print("--------------------------")

def main_expense_tracker():
    """Main function to run the expense tracker program."""
    expenses = load_expenses()
    print("Welcome to your Expense Tracker!")
    
    while True:
        print("\nMenu:")
        print("1. Add a new expense")
        print("2. View all expenses")
        print("3. Exit and Save")
        
        choice = input("Enter your choice (1/2/3): ")
        
        if choice == '1':
            add_expense(expenses)
        elif choice == '2':
            view_expenses(expenses)
        elif choice == '3':
            save_expenses(expenses)
            print("Expenses saved. Exiting. Goodbye!")
            break
        else:
            print("Invalid choice. Please select a valid option.")

# Call the main expense tracker function to run the program
if __name__ == "__main__":
    main_expense_tracker()