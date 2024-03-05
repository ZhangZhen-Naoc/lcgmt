let token = "6c4bfd9ffd59618566557195d0f0a733f246545b8b118ca7"
function createLeiaFilelist(obses) {
    return obses.reduce((lst, value) => {
        const cmosId = value.detnam.match(/\d+/)[0];
        return lst.concat([
            `${value.obs_id}/ep${value.obs_id}wxt${cmosId}.img`,
            // `${value.obs_id}/ep${value.obs_id}wxt${cmosId}.evt`,
        ])
    }, [])
}

function openPlatform(){
    window.open(`/ep/platform/jupyters/ep/notebooks/example.ipynb?token=6c4bfd9ffd59618566557195d0f0a733f246545b8b118ca7`)
}
function submitToLeiaPlatform(fileList) {
    
    $.ajax({
        type: "PUT",
        url: "/ep/platform/jupyters/ep/api/contents/file_list.txt",
        data: JSON.stringify({
            "content": filelist.join('\n'),
            "name": "file_list.txt",
            "format": "text",
            "type": "file"
        }),
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        }, success: function (res) {
            openPlatform()
        }
    });
}
