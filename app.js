// Regular expressions for validation
const strRegex = /^[a-zA-Z\s]*$/; // Only letters
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
const digitRegex = /^\d+$/;

// DOM elements
const countryList = document.getElementById('country-list');
const fullscreenDiv = document.getElementById('fullscreen-div');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('add-btn');
const closeBtn = document.getElementById('close-btn');
const modalBtns = document.getElementById('modal-btns');
const form = document.getElementById('modal');
const addrBookList = document.querySelector('#addr-book-list tbody');

// Variables for address data
let addrName = '';
let firstName = '';
let lastName = '';
let email = '';
let phone = '';
let streetAddr = '';
let postCode = '';
let city = '';
let country = '';
let labels = '';

// Function to get addresses from local storage
function getAddresses() {
    const addresses = localStorage.getItem('addresses');
    return addresses ? JSON.parse(addresses) : [];
}

// Function to add address to local storage
function addAddress(address) {
    const addresses = getAddresses();
    addresses.push(address);
    localStorage.setItem('addresses', JSON.stringify(addresses));
}

// Function to delete address from local storage
function deleteAddress(id) {
    let addresses = getAddresses();
    addresses = addresses.filter(address => address.id != id);
    localStorage.setItem('addresses', JSON.stringify(addresses));
    UI.closeModal();
    UI.renderAddressList();
}

// Function to update address in local storage
function updateAddress(updatedAddress) {
    let addresses = getAddresses();
    addresses = addresses.map(address => (address.id == updatedAddress.id ? updatedAddress : address));
    localStorage.setItem('addresses', JSON.stringify(addresses));
    UI.renderAddressList();
}

// UI Functions
const UI = {
    renderAddressList: function () {
        const addresses = getAddresses();
        addrBookList.innerHTML = ''; // Clear existing entries
        addresses.forEach(address => {
            const tableRow = document.createElement('tr');
            tableRow.setAttribute('data-id', address.id);
            tableRow.innerHTML = `
                <td>${address.id}</td>
                <td>
                    <span class="addressing-name">${address.addrName}</span><br>
                    <span class="address">${address.streetAddr} ${address.postCode} ${address.city} ${address.country}</span>
                </td>
                <td><span>${address.labels}</span></td>
                <td>${address.firstName + " " + address.lastName}</td>
                <td>${address.phone}</td>
                <td>
                    <button class="view-btn" data-id="${address.id}">View</button>
                    <button class="delete-btn" data-id="${address.id}">Delete</button>
                </td>
            `;
            addrBookList.appendChild(tableRow);
        });
    },

    showModal: function () {
        modal.style.display = 'block';
        fullscreenDiv.style.display = 'block';
    },

    closeModal: function () {
        modal.style.display = 'none';
        fullscreenDiv.style.display = 'none';
        form.reset();
    },

    showModalData: function (id) {
        const addresses = getAddresses();
        const address = addresses.find(address => address.id == id);
        if (address) {
            form.addr_ing_name.value = address.addrName;
            form.first_name.value = address.firstName;
            form.last_name.value = address.lastName;
            form.email.value = address.email;
            form.phone.value = address.phone;
            form.street_addr.value = address.streetAddr;
            form.postal_code.value = address.postCode;
            form.city.value = address.city;
            form.country.value = address.country;
            form.labels.value = address.labels;
            document.getElementById('modal-title').innerHTML = "Change Address Details";

            document.getElementById('modal-btns').innerHTML = `
                <button type="submit" id="update-btn" data-id="${id}">Update</button>
                <button type="button" id="delete-btn" data-id="${id}">Delete</button>
            `;
        }
    }
};

// Event listeners
function eventListeners() {
    addBtn.addEventListener('click', () => {
        document.getElementById('modal-title').innerHTML = "Add Address";
        UI.showModal();
        document.getElementById('modal-btns').innerHTML = `<button type="submit" id="save-btn"> Save </button>`;
    });

    closeBtn.addEventListener('click', UI.closeModal);

    modalBtns.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.id === "save-btn") {
            const isFormValid = getFormData();
            if (isFormValid) {
                const lastItemId = getAddresses().length > 0 ? getAddresses()[getAddresses().length - 1].id + 1 : 1;
                const addressItem = {
                    id: lastItemId,
                    addrName,
                    firstName,
                    lastName,
                    email,
                    phone,
                    streetAddr,
                    postCode,
                    city,
                    country,
                    labels
                };
                addAddress(addressItem);
                UI.closeModal();
                UI.renderAddressList();
            }
        }
    });

    addrBookList.addEventListener('click', (event) => {
        if (event.target.classList.contains('view-btn')) {
            const viewID = event.target.dataset.id;
            UI.showModalData(viewID);
            UI.showModal();
        }
    });

    modalBtns.addEventListener('click', (event) => {
        if (event.target.id === 'delete-btn') {
            deleteAddress(event.target.dataset.id);
        } else if (event.target.id === 'update-btn') {
            const id = event.target.dataset.id;
            const isFormValid = getFormData();
            if (isFormValid) {
                const updatedAddress = {
                    id,
                    addrName,
                    firstName,
                    lastName,
                    email,
                    phone,
                    streetAddr,
                    postCode,
                    city,
                    country,
                    labels
                };
                updateAddress(updatedAddress);
                UI.closeModal();
            }
        }
    });
}

// Load country list
function loadCountries() {
    fetch('countries.json')
        .then(response => response.json())
        .then(data => {
            countryList.innerHTML = data.map(country => `<option>${country.country}</option>`).join('');
        });
}

// Get form data
function getFormData() {
    let isValid = true;
    addrName = firstName = lastName = email = phone = streetAddr = postCode = city = labels = '';

    if (!strRegex.test(form.addr_ing_name.value) || form.addr_ing_name.value.trim().length === 0) {
        addErrMsg(form.addr_ing_name);
        isValid = false;
    } else {
        addrName = form.addr_ing_name.value;
    }

    if (!strRegex.test(form.first_name.value) || form.first_name.value.trim().length === 0) {
        addErrMsg(form.first_name);
        isValid = false;
    } else {
        firstName = form.first_name.value;
    }

    if (!strRegex.test(form.last_name.value) || form.last_name.value.trim().length === 0) {
        addErrMsg(form.last_name);
        isValid = false;
    } else {
        lastName = form.last_name.value;
    }

    if (!emailRegex.test(form.email.value)) {
        addErrMsg(form.email);
        isValid = false;
    } else {
        email = form.email.value;
    }

    if (!phoneRegex.test(form.phone.value)) {
        addErrMsg(form.phone);
        isValid = false;
    } else {
        phone = form.phone.value;
    }

    if (!(form.street_addr.value.trim().length > 0)) {
        addErrMsg(form.street_addr);
        isValid = false;
    } else {
        streetAddr = form.street_addr.value;
    }

    if (!digitRegex.test(form.postal_code.value)) {
        addErrMsg(form.postal_code);
        isValid = false;
    } else {
        postCode = form.postal_code.value;
    }

    if (!strRegex.test(form.city.value) || form.city.value.trim().length === 0) {
        addErrMsg(form.city);
        isValid = false;
    } else {
        city = form.city.value;
    }

    country = form.country.value;

    if (form.labels.value.trim().length > 0) {
        labels = form.labels.value;
    }

    return isValid;
}

// Add error message
function addErrMsg(el) {
    el.classList.add('error');
    el.addEventListener('input', () => {
        el.classList.remove('error');
    });
}

// Initialize app
function init() {
    loadCountries();
    UI.renderAddressList();
    eventListeners();
}

document.addEventListener('DOMContentLoaded', init);
