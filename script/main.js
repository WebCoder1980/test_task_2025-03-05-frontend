const apiHost = 'localhost';
const apiPort = 8082;

const apiUrl = `http://${apiHost}:${apiPort}/estore/api/employee`;

let currentEditId = null;

$(document).ready(function() {
    fetchItems();

    $('#create-btn').on('click', function() {
        const item = {
            lastName: $('#last-name').val(),
            firstName: $('#first-name').val(),
            patronymic: $('#patronymic').val(),
            birthDate: $('#birth-date').val(),
            positionId: $('#position-id').val(),
            shopId: $('#shop-id').val(),
            gender: $('#gender').val() === 'true'
        };
        createItem(item);
    });

    $('#update-btn').on('click', function() {
        const item = {
            lastName: $('#last-name').val(),
            firstName: $('#first-name').val(),
            patronymic: $('#patronymic').val(),
            birthDate: $('#birth-date').val(),
            positionId: $('#position-id').val(),
            shopId: $('#shop-id').val(),
            gender: $('#gender').val() === 'true'
        };
        updateItem(currentEditId, item);
    });
});

function fetchItems() {
    $.get(apiUrl, function(items) {
        renderItems(items);
    });
}

function renderItems(items) {
    $('#item-table-body').empty();
    items.forEach(item => {
        const row = `
            <tr data-id="${item.id}">
                <td>${item.id}</td>
                <td>${item.lastName}</td>
                <td>${item.firstName}</td>
                <td>${item.patronymic}</td>
                <td>${item.birthDate}</td>
                <td>${item.positionId}</td>
                <td>${item.shopId}</td>
                <td>${item.gender ? 'Мужчина' : 'Женщина'}</td>
                <td>
                    <button class="edit-btn">Редактировать</button>
                    <button class="delete-btn">Удалить</button>
                </td>
            </tr>
        `;
        $('#item-table-body').append(row);
    });

    $('.edit-btn').on('click', function() {
        const row = $(this).closest('tr');
        currentEditId = row.data('id');
        $('#last-name').val(row.find('td').eq(1).text());
        $('#first-name').val(row.find('td').eq(2).text());
        $('#patronymic').val(row.find('td').eq(3).text());
        $('#birth-date').val(row.find('td').eq(4).text());
        $('#position-id').val(row.find('td').eq(5).text());
        $('#shop-id').val(row.find('td').eq(6).text());
        $('#gender').val(row.find('td').eq(7).text() === 'Мужчина' ? 'true' : 'false');
        $('#create-btn').hide();
        $('#update-btn').show();
    });

    $('.delete-btn').on('click', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        deleteItem(id);
    });
}

function createItem(item) {
    $.ajax({
        url: apiUrl,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(item),
        success: function() {
            fetchItems();
        },
        error: function(xhr, status, error) {
            alert("Ошибка при создании элемента! Проверьте, что: 1. Все поля заполнены; 2. Дата-время корректно; 3. Существует ли 'ID должности' и 'ID магазина' в БД.");
        }
    });
}

function updateItem(id, item) {
    $.ajax({
        url: `${apiUrl}/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(item),
        success: function() {
            fetchItems();
            resetForm();
        },
        error: function(xhr, status, error) {
            alert("Ошибка при обновлении элемента! Проверьте, что: 1. Все поля заполнены; 2. Дата-время корректно; 3. Существует ли 'ID должности' и 'ID магазина' в БД.");
        }
    });
}

function deleteItem(id) {
    $.ajax({
        url: `${apiUrl}/${id}`,
        method: 'DELETE',
        success: function() {
            fetchItems();
        },
        error: function(xhr, status, error) {
            alert("Ошибка при удалении элемента! Проверьте, что: 1. Удаляемый объект всё ещё существует, обновите страницу.");
        }
    });
}

function resetForm() {
    $('#last-name').val('');
    $('#first-name').val('');
    $('#patronymic').val('');
    $('#birth-date').val('');
    $('#position-id').val('');
    $('#shop-id').val('');
    $('#gender').val('true');
    $('#create-btn').show();
    $('#update-btn').hide();
    currentEditId = null;
}