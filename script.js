document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalExpenseElem = document.getElementById('total-expense');
    const upiTotalElem = document.getElementById('upi-total');
    const cashTotalElem = document.getElementById('cash-total');
    const otherTotalElem = document.getElementById('other-total');
    const methodButtons = document.querySelectorAll('.btn');
    const resetButton = document.getElementById('reset-btn');
    const exportButton = document.getElementById('export-btn');

    let totalExpense = 0;
    let upiTotal = 0;
    let cashTotal = 0;
    let otherTotal = 0;
    let selectedMethod = 'UPI';

    // Handle payment method selection
    methodButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedMethod = button.dataset.method;
            methodButtons.forEach(btn => btn.style.background = '#4CAF50'); // Reset colors
            button.style.background = '#2E7D32'; // Highlight selected button
        });
    });

    // Handle form submission
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const amountInput = document.getElementById('amount');
        const descriptionInput = document.getElementById('description');
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();

        if (isNaN(amount) || amount <= 0 || !description) {
            alert('Please enter a valid amount and description.');
            return;
        }

        // Update totals
        totalExpense += amount;
        if (selectedMethod === 'UPI') {
            upiTotal += amount;
        } else if (selectedMethod === 'Cash') {
            cashTotal += amount;
        } else {
            otherTotal += amount;
        }

        // Update UI
        totalExpenseElem.textContent = totalExpense.toFixed(2);
        upiTotalElem.textContent = upiTotal.toFixed(2);
        cashTotalElem.textContent = cashTotal.toFixed(2);
        otherTotalElem.textContent = otherTotal.toFixed(2);

        // Add to expense history
        const dateTime = new Date().toLocaleString();
        const expenseItem = document.createElement('li');
        expenseItem.innerHTML = `
            <span>₹${amount.toFixed(2)} - ${selectedMethod}</span>
            <span>${description}</span>
            <span>${dateTime}</span>
        `;
        expenseList.appendChild(expenseItem);

        // Reset form
        amountInput.value = '';
        descriptionInput.value = '';
    });

    // Reset Button
    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset everything?')) {
            totalExpense = 0;
            upiTotal = 0;
            cashTotal = 0;
            otherTotal = 0;
            totalExpenseElem.textContent = '0';
            upiTotalElem.textContent = '0';
            cashTotalElem.textContent = '0';
            otherTotalElem.textContent = '0';
            expenseList.innerHTML = '';
        }
    });

    exportButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Add title
        doc.setFontSize(18);
        doc.text('Expense History', 10, 10);
    
        // Add table headers
        let y = 20; // Initial Y position
        doc.setFontSize(12);
        doc.text('Amount (₹)', 10, y);
        doc.text('Payment Method', 50, y);
        doc.text('Description', 100, y);
        doc.text('Date & Time', 160, y);
        y += 10;
    
        // Iterate through each expense item
        document.querySelectorAll('#expense-list li').forEach(item => {
            const [amount, description, datetime] = item.textContent.split('\n').map(str => str.trim());
    
            // Ensure text fits within PDF layout
            doc.text(amount, 10, y);
            doc.text(description, 50, y);
            doc.text(datetime, 160, y, { maxWidth: 40 });
            y += 10;
    
            // Check page break
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        });
    
        // Save the PDF
        doc.save('Expense_History.pdf');
    });
    
});
