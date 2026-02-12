import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Mail, CheckCircle, XCircle, Loader, AlertCircle, Info } from 'lucide-react';
import './App.css';

function App() {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [step, setStep] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const [botTyping, setBotTyping] = useState(false);


  // Configurações - ALTERE ESTAS URLs APÓS IMPORTAR OS WORKFLOWS NO N8N
  const N8N_BASE_URL = process.env.REACT_APP_N8N_URL || 'http://localhost:5678';
  const WEBHOOK_CHECK_AVAILABILITY = `${N8N_BASE_URL}/webhook/check-availability`;
  const WEBHOOK_CREATE_RESERVATION = `${N8N_BASE_URL}/webhook/create-reservation`;

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = () => {
    // Espaços disponíveis do Campus Cametá - sincronize com o banco de dados
    const campusSpaces = [
      // PRÉDIO ORLANDO CASSIQUE - TÉRREO
      {
        id: 'ORL-T-S01',
        name: 'SALA 01 - ORLANDO CASSIQUE (Térreo)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - TÉRREO',
        calendarId: '7866bb5ebef7871f4a3bb596f621112fcb861e37c092b40746c945b47274fbed@group.calendar.google.com'
      },
      {
        id: 'ORL-T-S02',
        name: 'SALA 02 - ORLANDO CASSIQUE (Térreo)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - TÉRREO',
        calendarId: '6660a21a5f5a89c1c67ac12da40ecd013bd2df7e304a5e2c756bb1dff9954aa9@group.calendar.google.com'
      },
      {
        id: 'ORL-T-S03',
        name: 'SALA 03 - ORLANDO CASSIQUE (Térreo)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - TÉRREO',
        calendarId: 'fe0a599842005fa69d539e4407b3fb851b894c7a68bb53b1a5e1e682b81f8079@group.calendar.google.com'
      },

      // PRÉDIO ORLANDO CASSIQUE - 1º ANDAR
      {
        id: 'ORL-1A-S01',
        name: 'SALA 01 - ORLANDO CASSIQUE (1º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s01@group.calendar.google.com'
      },
      {
        id: 'ORL-1A-S02',
        name: 'SALA 02 - ORLANDO CASSIQUE (1º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s02@group.calendar.google.com'
      },
      {
        id: 'ORL-1A-S03',
        name: 'SALA 03 - ORLANDO CASSIQUE (1º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s03@group.calendar.google.com'
      },
      {
        id: 'ORL-1A-S04',
        name: 'SALA 04 - ORLANDO CASSIQUE (1º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s04@group.calendar.google.com'
      },

      // PRÉDIO ORLANDO CASSIQUE - 2º ANDAR
      {
        id: 'ORL-2A-S05',
        name: 'SALA 05 - ORLANDO CASSIQUE (2º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s05@group.calendar.google.com'
      },
      {
        id: 'ORL-2A-S06',
        name: 'SALA 06 - ORLANDO CASSIQUE (2º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s06@group.calendar.google.com'
      },
      {
        id: 'ORL-2A-S07',
        name: 'SALA 07 - ORLANDO CASSIQUE (2º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s07@group.calendar.google.com'
      },
      {
        id: 'ORL-2A-S08',
        name: 'SALA 08 - ORLANDO CASSIQUE (2º Andar)',
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s08@group.calendar.google.com'
      },

      // PRÉDIO MARIA CORDEIRO - TÉRREO
      {
        id: 'MAR-T-S01',
        name: 'SALA 01 - MARIA CORDEIRO',
        capacity: 40,
        location: 'PRÉDIO MARIA CORDEIRO - TÉRREO',
        calendarId: 'maria-terreo-s01@group.calendar.google.com'
      },
      {
        id: 'MAR-T-S02',
        name: 'SALA 02 - MARIA CORDEIRO',
        capacity: 40,
        location: 'PRÉDIO MARIA CORDEIRO - TÉRREO',
        calendarId: 'maria-terreo-s02@group.calendar.google.com'
      },
      {
        id: 'MAR-T-S03',
        name: 'SALA 03 - MARIA CORDEIRO',
        capacity: 40,
        location: 'PRÉDIO MARIA CORDEIRO - TÉRREO',
        calendarId: 'maria-terreo-s03@group.calendar.google.com'
      },

      // PRÉDIO CARLOS AMORIM - TÉRREO
      {
        id: 'CAR-T-S01',
        name: 'SALA 01 - CARLOS AMORIM (Térreo)',
        capacity: 40,
        location: 'PRÉDIO CARLOS AMORIM - TÉRREO',
        calendarId: 'carlos-terreo-s01@group.calendar.google.com'
      },
      {
        id: 'CAR-T-S02',
        name: 'SALA 02 - CARLOS AMORIM (Térreo)',
        capacity: 40,
        location: 'PRÉDIO CARLOS AMORIM - TÉRREO',
        calendarId: 'carlos-terreo-s02@group.calendar.google.com'
      },

      // PRÉDIO CARLOS AMORIM - 1º ANDAR
      {
        id: 'CAR-1A-S03',
        name: 'SALA 03 - CARLOS AMORIM (1º Andar)',
        capacity: 40,
        location: 'PRÉDIO CARLOS AMORIM - 1º ANDAR',
        calendarId: 'carlos-1andar-s03@group.calendar.google.com'
      }
    ];
    setSpaces(campusSpaces);
  };

  const checkAvailability = async () => {
    if (!selectedSpace || !date || !startTime || !endTime) {
      setMessage({
        type: 'error',
        text: 'Preencha espaço, data e horários para verificar disponibilidade'
      });
      return;
    }

    if (endTime <= startTime) {
      setMessage({
        type: 'error',
        text: 'O horário de término deve ser posterior ao horário de início'
      });
      return;
    }

    setCheckingAvailability(true);
    setAvailability(null);
    setMessage({ type: '', text: '' });

    try {
      const selectedSpaceData = spaces.find(s => s.id === selectedSpace);

      const response = await fetch(WEBHOOK_CHECK_AVAILABILITY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: selectedSpace,
          calendarId: selectedSpaceData.calendarId,
          date: new Date(date).toISOString().split('T')[0],
          startTime,
          endTime
        })

      });

      const raw = await response.json();
      const data = Array.isArray(raw) ? raw[0] : raw;
      console.log(data)

      const isAvailable = data?.available === true || data?.available === "true";

      setAvailability(isAvailable);

      if (isAvailable) {
        setMessage({
          type: 'success',
          text: '✅ Espaço disponível no horário solicitado!'
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ Espaço indisponível. ${data?.conflictingEvents
            ? `Há ${data.conflictingEvents} evento(s) neste horário.`
            : 'Escolha outro horário.'
            }`
        });
      }

    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao verificar disponibilidade. Verifique se o N8N está rodando.'
      });
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSpace || !date || !startTime || !endTime || !requesterName || !requesterEmail) {
      setMessage({
        type: 'error',
        text: 'Por favor, preencha todos os campos obrigatórios'
      });
      return;
    }

    if (availability !== true) {
      setMessage({
        type: 'error',
        text: 'Por favor, verifique a disponibilidade antes de confirmar a reserva'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const selectedSpaceData = spaces.find(s => s.id === selectedSpace);

      const reservationData = {
        spaceId: selectedSpace,
        spaceName: selectedSpaceData.name,
        calendarId: selectedSpaceData.calendarId,
        capacity: selectedSpaceData.capacity,
        date,
        startTime,
        endTime,
        requesterName,
        requesterEmail,
        purpose: purpose || 'Não informado',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(WEBHOOK_CREATE_RESERVATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      });

      const raw = await response.json();
      const result = Array.isArray(raw) ? raw[0] : raw;

      const success = result?.success === true || result?.success === "true";

      if (response.ok && success) {
        setMessage({
          type: 'success',
          text: `🎉 Reserva confirmada com sucesso! Código: #${result.reservationId}. Você receberá um e-mail de confirmação.`
        });

        resetForm();
      } else {
        throw new Error(result?.message || 'Erro ao processar reserva');
      }

    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao processar sua reserva. Tente novamente ou contate o suporte.'
      });
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setSelectedSpace('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setRequesterName('');
    setRequesterEmail('');
    setPurpose('');
    setAvailability(null);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
  <div className="chat-layout">

    {/* SIDEBAR */}
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <h2>Campus Cametá</h2>
        <span>Sistema Inteligente de Reservas</span>
      </div>

      <div className="progress-section">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Espaço</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Data</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Horário</div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4. Dados</div>
        <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>5. Confirmação</div>
      </div>
    </aside>

    {/* CHAT AREA */}
    <main className="chat-main">

      <header className="chat-header-full">
        🤖 Assistente Virtual de Reservas
      </header>

      <div className="chat-messages">

        <div className="bot-bubble">
          Olá 👋 Eu vou ajudar você a reservar um espaço.
        </div>

        {step === 1 && (
          <div className="bot-bubble">
            Escolha o espaço desejado:
            <select
              className="chat-select"
              value={selectedSpace}
              onChange={(e) => {
                setSelectedSpace(e.target.value);
                setStep(2);
              }}
            >
              <option value="">Selecione</option>
              {spaces.map(space => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="bot-bubble">
            📅 Informe a data:
            <input
              type="date"
              min={getMinDate()}
              className="chat-input"
              onChange={(e) => {
                setDate(e.target.value);
                setStep(3);
              }}
            />
          </div>
        )}

        {step === 3 && (
          <div className="bot-bubble">
            ⏰ Defina os horários:
            <div className="time-row">
              <input
                type="time"
                className="chat-input"
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="time"
                className="chat-input"
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <button
              className="chat-btn"
              onClick={() => {
                checkAvailability();
                setStep(4);
              }}
            >
              Verificar disponibilidade
            </button>
          </div>
        )}

        {step === 4 && availability === true && (
          <div className="bot-bubble">
            👤 Agora seus dados:
            <input
              type="text"
              placeholder="Nome completo"
              className="chat-input"
              onChange={(e) => setRequesterName(e.target.value)}
            />
            <input
              type="email"
              placeholder="E-mail"
              className="chat-input"
              onChange={(e) => setRequesterEmail(e.target.value)}
            />
            <textarea
              placeholder="Finalidade"
              className="chat-input"
              onChange={(e) => setPurpose(e.target.value)}
            />
            <button
              className="chat-btn primary"
              onClick={(e) => {
                handleSubmit(e);
                setStep(5);
              }}
            >
              Confirmar Reserva
            </button>
          </div>
        )}

        {botTyping && <div className="typing">Digitando...</div>}

        {message.text && (
          <div className={`bot-bubble ${message.type}`}>
            {message.text}
          </div>
        )}

      </div>
    </main>
  </div>
);

}

export default App;