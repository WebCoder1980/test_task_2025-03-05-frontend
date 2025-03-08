const apiHost = 'localhost';
const apiPort = 8082;
const apiUrlRoot = `http://${apiHost}:${apiPort}/estore/api`;

const filenameEndpointMap = {
    'Employee.csv': 'employee',
    'PositionType.csv': 'positiontype',
    'ElectroEmployee.csv': 'electroemployee',
    'Shop.csv': 'shop',
    'ElectroShop.csv': 'electroshop',
    'ElectroItem.csv': 'electroitem',
    'ElectroType.csv': 'electroitemtype',
    'Purchase.csv': 'purchase',
    'PurchaseType.csv': 'purchasetype'
};

let filenameEndpointContentMap = {
    'Employee.csv': null,
    'PositionType.csv': null,
    'ElectroEmployee.csv': null,
    'Shop.csv': null,
    'ElectroShop.csv': null,
    'ElectroItem.csv': null,
    'ElectroType.csv': null,
    'Purchase.csv': null,
    'PurchaseType.csv': null
};

let filenameEndpointPriorityMap = {
    0: 'ElectroType.csv',
    1: 'PositionType.csv',
    2: 'PurchaseType.csv',
    3: 'ElectroItem.csv',
    4: 'Shop.csv',
    5: 'Employee.csv',
    6: 'Purchase.csv',
    7: 'ElectroEmployee.csv',
    8: 'ElectroShop.csv'
};

$(document).ready(function() {
   $('#upload-btn').on('click', function() {
        const fileInput = $('#file-upload')[0];
        const file = fileInput.files[0];
        if (file) {
            handleZIPUpload(file);
        } else {
            alert("Пожалуйста, выберите файл для загрузки.");
        }
   });
});

async function handleZIPUpload(file) {
    if (file) {
        let res = 0;

        const reader = new FileReader();
        reader.onload = async function(e) {
            const data = e.target.result;

            try {
                const zip = await JSZip.loadAsync(data);
                const readPromises = [];

                zip.forEach(function(filename, file) {
                    if (filenameEndpointMap.hasOwnProperty(filename)) {
                        const promise = file.async('arraybuffer').then(function(arrayBuffer) {
                            filenameEndpointContentMap[filename] = arrayBuffer;
                        });
                        readPromises.push(promise);
                    } else {
                        console.warn(`Файл ${filename} не найден в маппинге.`);
                    }
                });

                await Promise.all(readPromises);

                for (let i = 0; i < 9; i++) {
                    const filename = filenameEndpointPriorityMap[i];
                    const content = filenameEndpointContentMap[filename];
                    const endpoint = filenameEndpointMap[filename];

                    if (content) {
                        await handleCSVUpload(filename, content, endpoint);
                        res++;
                    } else {
                        console.warn(`Файл ${filename} не был прочитан.`);
                        return;
                    }
                }

            } catch (error) {
                alert('Ошибка при распаковке ZIP файла, убедитесь, что архив целый.');
            }
        };
        
        reader.readAsArrayBuffer(file);

        if (Object.keys(filenameEndpointPriorityMap).length) {
            alert('Успешно импортировано!');
        }
    } else {
        alert("Пожалуйста, выберите файл для загрузки.");
    }
}

async function handleCSVUpload(filename, content, endpoint) {
    const formData = new FormData();
    const blob = new Blob([content], { type: 'application/csv' });
    formData.append('file', blob, `${endpoint}.csv`);

    try {
        const response = await $.ajax({
            url: `${apiUrlRoot}/${endpoint}/upload-csv`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false
        });

    } catch (ex) {
        alert(`Ошибка при загрузке файла типа ${filename}. Проверьте, что: 1. Файл имеет верный формат; 2. Если текущая таблица БД зависит от другой, то убедитесь, что вы импортировали данные в неё.`);
    }
}
