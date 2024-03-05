
$(document).ready(function(){
    $(".src-table>dt").addClass('col-4')
    $(".src-table>dd").addClass('col-2')
})
/**
 * 创建显示source的dl
 * @param {css selector} el 
 * @param {*} src source
 */
function create_source_dl(el, src) {
    var dl = document.getElementById(el)
    for (let k in src) {
        var dt = document.createElement("dt")
        dt.innerText = k
        var dd = document.createElement("dd")
        dd.innerText = src[k]
        dl.appendChild(dt)
        dl.appendChild(dd)

    }
}