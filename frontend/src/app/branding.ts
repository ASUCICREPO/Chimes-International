// Centralized branding configuration for white-label deployment.
// Deployers: customize this file and replace /logo.png with your organization's logo.

export const branding = {
  appName: 'Knowledge Companion',
  orgName: 'Your Organization',
  logoPath: '/logo.svg',
  logoAlt: 'Logo',
  supportEmail: 'support@yourorganization.com',
  adminEmail: 'admin@yourorganization.com',
  localStoragePrefix: 'kb_',
  baseUrl: 'https://yourorganization.com',

  translations: {
    en: {
      title: 'Knowledge Companion',
      welcome:
        "Hello! I'm the Knowledge Companion. I'm here to help you with questions about HR policies, IT support, benefits, training, and more. How can I assist you today?",
      placeholder:
        'Ask your own question about policies, programs, or resources...',
      ssoButton: 'Sign in with SSO',
      loginWelcome: 'Welcome to Knowledge Companion',
      loginSubtitle: 'Sign in to access trusted resources',
    },
    es: {
      title: 'Compañero de Conocimiento',
      welcome:
        '¡Hola! Soy el Compañero de Conocimiento. Estoy aquí para ayudarte con preguntas sobre políticas de recursos humanos, soporte de TI, beneficios, capacitación y más. ¿Cómo puedo asistirte hoy?',
      placeholder:
        'Haz tu propia pregunta sobre políticas, programas o recursos...',
      ssoButton: 'Iniciar sesión con SSO',
      loginWelcome: 'Bienvenido al Compañero de Conocimiento',
      loginSubtitle: 'Inicia sesión para acceder a recursos confiables',
    },
  },

  responses: {
    en: {
      'Benefits & PTO': {
        content:
          'The organization offers comprehensive benefits including medical, dental, and vision coverage. Full-time employees receive 15 days of PTO annually, increasing with tenure. You also have access to 401(k) matching and wellness programs.',
        citations: [
          { text: 'Benefits Guide 2025', url: '' },
          { text: 'PTO Policy', url: '' },
        ],
      },
      'Employee Handbook': {
        content:
          'The Employee Handbook covers our policies, procedures, code of conduct, and organizational values. You can find information on workplace expectations, safety protocols, and employee resources.',
        citations: [{ text: 'Employee Handbook', url: '' }],
      },
      'IT Help': {
        content:
          'For IT support, you can submit a ticket through our internal portal or contact the IT helpdesk at ext. 5555. Common issues like password resets, software installations, and access requests are usually resolved within 24 hours.',
        citations: [{ text: 'IT Support Portal', url: '' }],
      },
      'Training Requirements': {
        content:
          'All employees must complete annual training modules including: HIPAA compliance, workplace safety, diversity & inclusion, and cybersecurity awareness. New employees have additional onboarding requirements specific to their role.',
        citations: [
          { text: 'Training Portal', url: '' },
          { text: 'Compliance Requirements', url: '' },
        ],
      },
    },
    es: {
      'Beneficios y PTO': {
        content:
          'La organización ofrece beneficios integrales que incluyen cobertura médica, dental y de visión. Los empleados de tiempo completo reciben 15 días de PTO anualmente, que aumentan con la antigüedad. También tienes acceso a igualación 401(k) y programas de bienestar.',
        citations: [
          { text: 'Guía de Beneficios 2025', url: '' },
          { text: 'Política de PTO', url: '' },
        ],
      },
      'Manual del Empleado': {
        content:
          'El Manual del Empleado cubre nuestras políticas, procedimientos, código de conducta y valores organizacionales. Puedes encontrar información sobre expectativas laborales, protocolos de seguridad y recursos para empleados.',
        citations: [{ text: 'Manual del Empleado', url: '' }],
      },
      'Ayuda de TI': {
        content:
          'Para soporte de TI, puedes enviar un ticket a través de nuestro portal interno o contactar al servicio de ayuda de TI en la ext. 5555. Los problemas comunes como restablecimiento de contraseñas, instalaciones de software y solicitudes de acceso generalmente se resuelven en 24 horas.',
        citations: [{ text: 'Portal de Soporte de TI', url: '' }],
      },
      'Requisitos de Capacitación': {
        content:
          'Todos los empleados deben completar módulos de capacitación anual que incluyen: cumplimiento de HIPAA, seguridad en el lugar de trabajo, diversidad e inclusión, y conciencia de ciberseguridad. Los nuevos empleados tienen requisitos de incorporación adicionales específicos para su función.',
        citations: [
          { text: 'Portal de Capacitación', url: '' },
          { text: 'Requisitos de Cumplimiento', url: '' },
        ],
      },
    },
  },
};

export function getCitationUrl(path: string): string {
  return `${branding.baseUrl}${path}`;
}

export function getLocalStorageKey(key: string): string {
  return `${branding.localStoragePrefix}${key}`;
}
