$(document).ready(() => {
    $('form').submit((e) => {
        e.preventDefault()

        const data = {
            specs: $('[name="specs"]').val(),
            autoname: $('[name="autoname"]').prop('checked'),
            name: $('[name="name"]').val(),
            sname: $('[name="sname"]').val(),
            role: $('[name="role"]').val(),
            level: $('[name="level"]').val()
        }
        
        $.post('/', data, function(data) {
            const cv = data.cv
            
            $('.col').eq(1).show()

            $('#photo').attr('src', cv.photo)
            $('#name').html(cv.name)
            $('#sname').html(cv.sname)
            $('#role').html(cv.role)
            $('#exp').html(cv.exp)
            $('#about').html(cv.about)

            $('#work').empty()
            for (let w of cv.work) {
                $('#work').append( `<tr>
                    <td valign="top">${w.start} - ${w.end}</td>
                    <td valign="top">
                        <b>${w.company}</b><br><i>${w.role}</i>
                        <ul>
                            ${w.contributions.map(x => x ? '<li>' + x + '</li>' : '').join('')}
                        </ul>
                    </td>
                </tr>`)
            }
           
            $('#generalSkills').html(cv.generalSkills.filter(x => x).join(', '))
            $('#proSkills').html(cv.proSkills.filter(x => x).join(', '))
        })
    })
})