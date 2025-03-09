const apiHost = 'localhost';
const apiPort = 8082;
const apiUrl = `http://${apiHost}:${apiPort}/estore/api/electroemployee`;

const pageLength = 10;
let currentPage = 0;

let currentEditEmployeeId = null;
let currentEditElectroTypeId = null;

$(document).ready(function() {
    fetchItems();

    $('#create-btn').on('click', function() {
        const item = {
            employeeId: $('#employeeId').val(),
            electroTypeId: $('#electroTypeId').val()
        };
        createItem(item);
    });
    
    $('#update-btn').on('click', function() {
        const item = {
            employeeId: $('#employeeId').val(),
            electroTypeId: $('#electroTypeId').val()
        };
        
        updateItem(item);
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
            <tr data-employeeId="${item.employeeId}" data-electroid="${item.electroTypeId}">
                <td>${item.electroTypeId}</td>
                <td>${item.employeeId}</td>
                <td>
                    <button class="delete-btn">Удалить</button>
                </td>
            </tr>
        `;
        $('#item-table-body').append(row);
    });

    $('.edit-btn').on('click', function() {
        const row = $(this).closest('tr');
        currentEditEmployeeId = row.data('employeeid');
        currentEditElectroTypeId = row.data('electroid');

        $('#employeeId').val(row.find('td').eq(0).text());
        $('#electroTypeId').val(row.find('td').eq(1).text());
        $('#create-btn').hide();
        $('#update-btn').show();
    });

    $('.delete-btn').on('click', function() {
        const row = $(this).closest('tr');
        const employeeId = row.data('employeeid');
        const electroId = row.data('electroid');
        
        deleteItem(employeeId, electroId);
    });

    $('#current-page').val(currentPage + 1);
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

function updateItem(item) {
    $.ajax({
        url: `${apiUrl}?employeeid=${currentEditEmployeeId}&electrotypeid=${currentEditElectroTypeId}`,
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

function deleteItem(employeeId, electroTypeId) {
    $.ajax({
        url: `${apiUrl}?employeeid=${employeeId}&electrotypeid=${electroTypeId}`,
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
    $('#employeeId').val('');
    $('#electroTypeId').val('');
    $('#create-btn').show();
    $('#update-btn').hide();

    currentEditEmployeeId = null;
    currentEditElectroTypeId = null;
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