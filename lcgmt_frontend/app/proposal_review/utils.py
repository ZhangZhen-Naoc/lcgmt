# 处理国台不同邮箱后缀
def format_email(email):
    email_lower = email.lower()
    emails = [email_lower]
    if email_lower.endswith('@nao.cas.cn'):
        emails.append(email_lower.replace('@nao.cas.cn', '@bao.ac.cn'))
    if email_lower.endswith('@bao.ac.cn'):
        emails.append(email_lower.replace('@bao.ac.cn', '@nao.cas.cn'))
    return emails