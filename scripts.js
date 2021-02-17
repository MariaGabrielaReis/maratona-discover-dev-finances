const Modal = {
  toggle() {
    document.querySelector(".modal-overlay").classList.toggle("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("maby.finances_transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "maby.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    //soma das entradas
    let income = 0;
    Transaction.all.forEach((transactions) => {
      if (transactions.amount > 0) {
        income += transactions.amount;
      }
    });

    return income;
  },

  expenses() {
    //somar saídas
    let expense = 0;
    Transaction.all.forEach((transactions) => {
      if (transactions.amount < 0) {
        expense += transactions.amount;
      }
    });

    return expense;
  },

  total() {
    //entradas - saídas == entradas + (- saídas)
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
          <td class="description">${transaction.description}</td>
          <td class="${CSSclass}">${amount}</td>
          <td class="date">${transaction.date}</td>
          <td>
            <img id="remove-icon" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
          </td>
        `;

    return html;
  },

  uptadeBalance() {
    document.getElementById("incomesDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expensesDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );

    if (Transaction.total() < 0) {
      document.getElementById("card-total").style.backgroundColor = "#EE4747";
    } else {
      document.getElementById("card-total").style.backgroundColor = "#7ed160";
    }
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = value * 100;
    return Math.round(value);
  },

  formatDate(date) {
    //a data vem como ano-mês-dia
    const splitteDate = date.split("-");

    return `${splitteDate[2]}/${splitteDate[1]}/${splitteDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, ""); // \D significa tudo que não for número
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateField() {
    //tem todas as informações?
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    //formatar os dados para salvar
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault(); //tira o envio padrão pela URL

    try {
      //tem todas as informações?
      Form.validateField();

      //formatar os dados para salvar
      const transaction = Form.formatValues();

      //adicionar a transação
      Transaction.add(transaction);

      //limpar form
      Form.clearFields();

      //fechar modal
      Modal.toggle();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);

    DOM.uptadeBalance();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

const Mode = {
  dark() {
    var link = document.getElementById("file-mode").innerHTML =
      '<link id="file-mode" rel="stylesheet" href="dark-mode.css"/>';
  },

  light() {
    var link = document.getElementById("file-mode").innerHTML =
      '<link id="file-mode" rel="stylesheet" href="light-mode.css"/>';
    },
};

App.init();
