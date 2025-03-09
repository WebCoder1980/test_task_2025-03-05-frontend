const apiHost = 'localhost';
const apiPort = 8082;
const apiUrl = `http://${apiHost}:${apiPort}/estore/api/electroshop`;

const pageLength = 10;
let currentPage = 0;

let currentEditShopId = null;
let currentEditElectroId = null;

const shopId = (new URL(window.location.href).searchParams.get('shopid'));

$(document).ready(function() {

    fetchItems();

    $('#create-btn').on('click', function() {
        const item = {
            shopId: $('#shopId').val(),
            electroId: $('#electroId').val(),
            quantity: $('#quantity').val()
        };
        createItem(item);
    });
    
    $('#update-btn').on('click', function() {
        const item = {
            shopId: $('#shopId').val(),
            electroId: $('#electroId').val(),
            quantity: $('#quantity').val()
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

    let queryUrl = `${apiUrl}?start=${start}&limit=${limit}`;
    if (shopId) {
        queryUrl += `&shopid=${shopId}`;
    }

    $.get(queryUrl, function(items) {
        renderItems(items);
    });
}

function renderItems(items) {
    $('#item-table-body').empty();
    items.forEach(item => {
        const isHide = item.quantity<=0; 
        const row = `
            <tr data-shopid="${item.shopId}" data-electroid="${item.electroId}" ${isHide ? 'style="opacity: 0.2;"':''}>
                <td>${isHide?"Нет":"Да"}</td>
                <td>${item.shopId}</td>
                <td>${item.electroId}</td>
                <td>${item.quantity}</td>
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
        currentEditShopId = row.data('shopid');
        currentEditElectroId = row.data('electroid');

        $('#shopId').val(row.find('td').eq(1).text());
        $('#electroId').val(row.find('td').eq(2).text());
        $('#quantity').val(row.find('td').eq(3).text());
        $('#create-btn').hide();
        $('#update-btn').show();
    });

    $('.delete-btn').on('click', function() {
        const row = $(this).closest('tr');
        const shopId = row.data('shopid');
        const electroId = row.data('electroid');
        
        deleteItem(shopId, electroId);
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
        url: `${apiUrl}?shopid=${currentEditShopId}&electroid=${currentEditElectroId}`,
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

function deleteItem(shopId, electroId) {
    $.ajax({
        url: `${apiUrl}?shopid=${shopId}&electroid=${electroId}`,
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
    $('#shopId').val('');
    $('#electroId').val('');
    $('#quantity').val('');
    $('#create-btn').show();
    $('#update-btn').hide();

    currentEditShopId = null;
    currentEditElectroId = null;
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