const Modal = { /* Object */
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [] /* JSON.parse transforma uma string em array */
    },

    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions)) /* nome escolhido dev.finances:transactions.  */ /* JSON.stringfy transforma o array para string */
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1) /* splice deleta em arrays. Nesse caso 1*/

        App.reload()
    },

    incomes() {
        let income = 0;
        // pegar todas as transacoes
        //para cada transacao
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if(transaction.amount > 0) {
                // somar a uma variavel e retornar a variavel
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        // pegar todas as transacoes
        //para cada transacao
        Transaction.all.forEach(transaction => {
            // se ela for menor que zero
            if(transaction.amount < 0) {
                // somar a uma variavel e retornar a variavel
                expense += transaction.amount;
            }

        })
         return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

/* Substituir os dados do HTML com os dados do JS */
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
                        <td class="description">${transaction.description}</td>
                        <td class="${CSSclass}">${amount}</td>
                        <td class="date">${transaction.date}</td>
                        <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
                    `

                    return html
    },

    updateBalance() {
        document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.querySelector('#expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = { 
    formatCurrency(value) { // formata o valor
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '') /* RegEx -> /\D/g = Ache só números , e troque por '' */

        value = Number(value) / 100 /* Trick, pois os numeros foram guardados multiplicados por 100 */

        value = value.toLocaleString('pt-br', { /* localidade */
            style: 'currency',
            currency: 'BRL'
        })
        return signal + value
    },

    formatAmount(value) {
        value = value * 100

        return Math.round(value) /* arredonda o número que foi passado como argumento */
    },

    formatDate(date) {
        const splittedDate = date.split('-') /* para separar os números de dia, mês e ano. */
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}` /* Reorganizar o tipo da data dia/mês/ano */
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields() { // verificar se todas as informacoes foram preenchidas
        const {description, amount, date} = Form.getValues()

        /* trim limpa os espaços vazios que existem na string */
        if(description.trim() === '' || amount.trim() === '' || date.trim() === '') { 
            throw new Error('Por favor, preencha todos os campos')
        }

    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description, /* shorthand */
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulario
            Form.clearFields()
            // fechar modal
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => { 
            DOM.addTransaction(transaction, index) 
            /* atalho para as linhas 206 e 207 -> Transaction.all.forEach(DOM.addTransaction) */
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions() 
        App.init()
    },
}

App.init()