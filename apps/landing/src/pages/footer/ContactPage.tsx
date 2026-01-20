import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppFooter } from '../../components/footer/AppFooter';
import Logo from '../../components/logo/Logo';
import { useToast } from '../../components/ui/Toast';
import { feedbackApi, getBrowserInfo } from '../../services/feedbackApi';
import styles from './FooterPage.module.css';

export function ContactPage() {
  const { t } = useTranslation('common');
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const description = `[${formData.subject}]\n\nDe: ${formData.name}\n\n${formData.message}`;

      await feedbackApi.create({
        type: 'CONTACT',
        description,
        pageUrl: window.location.href,
        userEmail: formData.email,
        senderName: formData.name,
        subject: formData.subject,
        browserInfo: getBrowserInfo(),
      });

      toast.success(t('legal.contact.success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error(t('legal.contact.error') || 'Error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('app.back')}
          </Link>
          <Link to="/" className={styles.logoLink}>
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t('legal.contact.title')}</h1>

          <section className={styles.section}>
            <p className={styles.text}>{t('legal.contact.intro')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.contact.formTitle')}</h2>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="contact-name" className={styles.formLabel}>
                  {t('legal.contact.name')} *
                </label>
                <input
                  type="text"
                  id="contact-name"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-email" className={styles.formLabel}>
                  {t('legal.contact.email')} *
                </label>
                <input
                  type="email"
                  id="contact-email"
                  className={styles.formInput}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-subject" className={styles.formLabel}>
                  {t('legal.contact.subject')} *
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  className={styles.formInput}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-message" className={styles.formLabel}>
                  {t('legal.contact.message')} *
                </label>
                <textarea
                  id="contact-message"
                  className={styles.formTextarea}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('app.sending') : t('app.send')}
              </button>
            </form>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default ContactPage;
