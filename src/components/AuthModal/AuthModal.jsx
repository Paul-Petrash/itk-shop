import { useState, useEffect, useRef } from 'preact/hooks';

import closeSvg   from '@/assets/icons/close.svg?raw';
import eyeSvg     from '@/assets/icons/eye.svg?raw';
import eyeOffSvg  from '@/assets/icons/eye-off.svg?raw';
import yandexSvg  from '@/assets/icons/social-yandex.svg?raw';
import mailSvg    from '@/assets/icons/social-mail.svg?raw';
import vkSvg      from '@/assets/icons/social-vk.svg?raw';
import okSvg      from '@/assets/icons/social-ok.svg?raw';

/* ── shared primitives ── */

function ModalHead({ title, desc }) {
  return (
    <div class="am-head">
      <p class="am-logo"><span class="am-logo-c">ITK</span> ID</p>
      <p class="am-title">{title}</p>
      <p class="am-desc">{desc}</p>
    </div>
  );
}

function CheckRow({ checked, onChange, defaultChecked, children }) {
  return (
    <label class="am-check-row">
      <input class="am-chk" type="checkbox"
        checked={checked} onChange={onChange} defaultChecked={defaultChecked} />
      <span class="am-chk-box" aria-hidden="true" />
      <span class="am-chk-text">{children}</span>
    </label>
  );
}

/* ── SMS tab ── */

function SmsForm() {
  const [consent, setConsent] = useState(false);
  const [news,    setNews]    = useState(true);

  return (
    <>
      <ModalHead
        title="Вход или регистрация"
        desc="Укажите номер телефона, чтобы войти или зарегистрироваться. Код может прийти в Telegram или в СМС."
      />

      <form class="am-form" onSubmit={e => e.preventDefault()}>
        <div class="am-field">
          <label class="am-label" for="am-phone">Номер телефона <span class="am-req">*</span></label>
          <input class="am-input" type="tel" id="am-phone" placeholder="+7 (___) ___-__-__" />
        </div>

        <div class="am-captcha">
          <p class="am-captcha-label">Введите код с картинки</p>
          <div class="am-captcha-img">
            <svg width="180" height="47" viewBox="0 0 180 47" aria-label="captcha">
              <rect width="180" height="47" fill="#f0f0f0" rx="4"/>
              <text x="18" y="33" font-size="22" font-family="monospace" letter-spacing="8"
                fill="#333" font-weight="bold" transform="rotate(-2,90,24)">X4Rk9</text>
              <line x1="0" y1="20" x2="180" y2="27" stroke="#ccc" stroke-width="1"/>
            </svg>
          </div>
          <input class="am-input" type="text" placeholder="Код с картинки" autocomplete="off" />
        </div>

        <div class="am-checks">
          <CheckRow checked={consent} onChange={e => setConsent(e.target.checked)}>
            Соглашаюсь на{' '}
            <a href="#" class="am-link">обработку персональных данных</a>
            {' '}в соответствии с{' '}
            <a href="#" class="am-link">Политикой конфиденциальности</a>
          </CheckRow>
          <CheckRow checked={news} onChange={e => setNews(e.target.checked)}>
            Соглашаюсь получать новости и специальные предложения
          </CheckRow>
        </div>

        <button class="am-btn" type="submit" disabled={!consent}>Выслать код</button>

        <p class="am-oferta">
          Нажимая «Выслать код», вы принимаете условия{' '}
          <a href="#" class="am-link">оферты</a>
        </p>
      </form>
    </>
  );
}

/* ── Email tab ── */

function EmailForm() {
  const [consent,  setConsent]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <ModalHead
        title="Войдите по почте"
        desc="Только для зарегистрированных пользователей"
      />

      <form class="am-form" onSubmit={e => e.preventDefault()}>
        <div class="am-field">
          <label class="am-label" for="am-email">E-mail <span class="am-req">*</span></label>
          <input class="am-input" type="email" id="am-email" autocomplete="email" />
        </div>

        <div class="am-field">
          <label class="am-label" for="am-pass">Пароль <span class="am-req">*</span></label>
          <div class="am-pass-wrap">
            <input class="am-input" type={showPass ? 'text' : 'password'}
              id="am-pass" autocomplete="current-password" />
            <button
              class="am-eye" type="button"
              aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowPass(v => !v)}
              dangerouslySetInnerHTML={{ __html: showPass ? eyeOffSvg : eyeSvg }}
            />
          </div>
        </div>

        <div class="am-row-between">
          <CheckRow defaultChecked>Запомнить меня</CheckRow>
          <a href="#" class="am-link am-forgot">Забыли пароль?</a>
        </div>

        <div class="am-checks">
          <CheckRow checked={consent} onChange={e => setConsent(e.target.checked)}>
            Соглашаюсь на{' '}
            <a href="#" class="am-link">обработку персональных данных</a>
          </CheckRow>
        </div>

        <button class="am-btn" type="submit" disabled={!consent}>Войти</button>

        <div class="am-socials">
          <p class="am-socials-title">Войти с помощью</p>
          <div class="am-socials-grid">
            <button class="am-soc am-soc-ya"   type="button" aria-label="Яндекс"
              dangerouslySetInnerHTML={{ __html: yandexSvg }} />
            <button class="am-soc am-soc-mail" type="button" aria-label="Mail.ru"
              dangerouslySetInnerHTML={{ __html: mailSvg }} />
            <button class="am-soc am-soc-vk"   type="button" aria-label="ВКонтакте"
              dangerouslySetInnerHTML={{ __html: vkSvg }} />
            <button class="am-soc am-soc-ok"   type="button" aria-label="Одноклассники"
              dangerouslySetInnerHTML={{ __html: okSvg }} />
          </div>
        </div>
      </form>
    </>
  );
}

/* ── Root ── */

export default function AuthModal() {
  const dialogRef = useRef(null);
  const [tab, setTab] = useState('sms');

  useEffect(() => {
    const onOpen = () => { setTab('sms'); dialogRef.current?.showModal(); };
    window.addEventListener('auth:open', onOpen);
    return () => window.removeEventListener('auth:open', onOpen);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog ref={dialogRef} class="am-dialog"
      onClick={e => e.target === e.currentTarget && close()}>
      <div class="am-box">

        <button class="am-x" type="button" aria-label="Закрыть" onClick={close}
          dangerouslySetInnerHTML={{ __html: closeSvg }} />

        <div class="am-tab">
          {tab === 'sms' ? <SmsForm /> : <EmailForm />}
        </div>

        <div class="am-switch-wrap">
          <button class="am-switch-btn" type="button"
            onClick={() => setTab(t => t === 'sms' ? 'email' : 'sms')}>
            {tab === 'sms'
              ? 'Войти через почту или социальные сети'
              : 'Войти по номеру телефона'}
          </button>
        </div>

      </div>
    </dialog>
  );
}
