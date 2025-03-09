const apiHost = 'localhost';
const apiPort = 8082;
const apiUrl = `http://${apiHost}:${apiPort}/estore/api/employee`;

const pageLength = 10;
let currentPage = 0;

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

    $('#upload-btn').on('click', function() {
        const fileInput = $('#file-upload')[0];
        const file = fileInput.files[0];
        if (file) {
            handleFileUpload(file);
            fetchItems();
        } else {
            alert("Пожалуйста, выберите файл для загрузки.");
        }
    });

    $('#home-btn').on('click', function() {
        currentPage = 0;
        fetchItems();
    });

    $('#prev-btn').on('click', function() {
        currentPage = Math.max(currentPage-1, 0);
        fetchItems();
    });

    $('#next-btn').on('click', function() {
        currentPage++;
        fetchItems();
    });
});

function fetchItems() {
    const start = currentPage * pageLength;
    const limit = pageLength;
    const queryUrl = `${apiUrl}?start=${start}&limit=${limit}`;

    $.get(queryUrl, function(items) {
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

    $('#current-page').val(currentPage+1);
}

function createItem(item) {
    $.ajax({
        url: apiUrl,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(item),
        success: function() {
            fetchItems();
            resetForm();
        },
        error: function(xhr, status, error) {
            alert("Ошибка при создании элемента! Проверьте, что: 1. Все поля заполнены; 2. Все поля корректны; 3. Существует ли записи в других таблица БД, от которых зависит текущая.");
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
            alert("Ошибка при обновлении элемента! Проверьте, что: 1. Все поля заполнены; 2. Все поля корректны; 3. Существует ли записи в других таблица БД, от которых зависит текущая.");
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
            alert("Ошибка при удалении элемента! Проверьте, что: 1. То, что этот объект не зависит от других; 2. Удаляемый объект всё ещё существует, обновите страницу.");
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

function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);

    $.ajax({
        url: `${apiUrl}/upload-csv`,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            alert("Файл успешно загружен");
            fetchItems();
        },
        error: function(xhr, status, error) {
            alert("Ошибка при загрузке файла. Проверьте, что: 1. Файл имеет верный формат; 2. Если текущая таблица БД зависит от другой, то убедитесь, что вы импортировали данные в неё.");
        }
    });
}