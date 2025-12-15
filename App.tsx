import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LogIn, 
  LayoutDashboard, 
  BookOpen, 
  LogOut, 
  ShieldCheck, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2,
  CreditCard
} from 'lucide-react';
import { 
  getCurrentUser, 
  getChapters, 
  getUsers, 
  saveUsers, 
  setAuthId, 
  id, 
  nowISO, 
  addYearsISO,
  getChapterResponses,
  saveUserResponse
} from './services/storage';
import { User, Chapter, QCMItem } from './types';
import { GLUCIDES_QCMS, LIPIDES_QCMS, AMINO_QCMS, NUCLEIC_QCMS } from './constants';

type ViewState = 'home' | 'login' | 'register' | 'dashboard' | 'chapter';

// --- SUB-COMPONENTS ---

// 1. Header
const Header = ({ user, onLogout, onNavigate }: { user: User | null, onLogout: () => void, onNavigate: (v: ViewState) => void }) => (
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => onNavigate('home')}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-200">
          <span className="font-bold text-lg">QB</span>
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight hidden sm:block">QCM Biochimie Pro</span>
      </div>

      <div className="flex items-center gap-3">
        {!user ? (
          <>
            <button 
              onClick={() => onNavigate('login')}
              className="text-slate-600 hover:text-slate-900 font-medium px-3 py-2 text-sm transition-colors"
            >
              Connexion
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all hover:shadow-lg flex items-center gap-2"
            >
              <Users size={16} />
              <span>Inscription</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-teal-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              <LayoutDashboard size={18} />
              <span>Tableau de bord</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <button 
              onClick={onLogout}
              className="text-rose-500 hover:text-rose-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </>
        )}
      </div>
    </div>
  </header>
);

// 2. Auth Forms
const Auth = ({ type, onAuthSuccess, onBack }: { type: 'login' | 'register', onAuthSuccess: (uid: string) => void, onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) {
      setError('Tous les champs sont requis.');
      return;
    }
    const users = getUsers();
    
    if (type === 'register') {
      if (users.some(u => u.email === email)) {
        setError('Cet email est déjà utilisé.');
        return;
      }
      const newUser: User = { 
        id: id(), 
        email, 
        password: pass, 
        paid: false, 
        pending: false, 
        paymentDate: null, 
        expiresAt: null, 
        paymentTimer: null 
      };
      saveUsers([...users, newUser]);
      onAuthSuccess(newUser.id);
    } else {
      const u = users.find(x => x.email === email && x.password === pass);
      if (!u) {
        setError('Identifiants incorrects.');
        return;
      }
      onAuthSuccess(u.id);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800">{type === 'register' ? 'Créer un compte' : 'Connexion'}</h2>
          <p className="text-slate-500 text-sm mt-2">Accédez à votre espace QCM professionnel</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mot de passe</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              value={pass} onChange={e => setPass(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="remember" 
              checked={remember} onChange={e => setRemember(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <label htmlFor="remember" className="text-sm text-slate-600">Se souvenir de moi</label>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
          >
            {type === 'register' ? "S'inscrire et continuer" : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Retour à l'accueil</button>
        </div>
      </div>
    </div>
  );
};

// 3. Dashboard
const Dashboard = ({ user, onViewChapter, refreshUser }: { user: User, onViewChapter: (cid: string) => void, refreshUser: () => void }) => {
  const [txId, setTxId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  
  // Constants
  const MOMO = '0151112644';
  const USSD = `*880*1*1*${MOMO}*${MOMO}*500*1#`; // Code simplifié
  const USSD_TEL = 'tel:' + encodeURIComponent(USSD);

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (!txId || txId.length < 5) {
      setVerifyError("L'ID de transaction semble invalide ou trop court.");
      return;
    }

    setIsVerifying(true);

    // Simulation de vérification serveur (2 secondes)
    setTimeout(() => {
      const users = getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      
      if (idx !== -1) {
        // Validation réussie
        users[idx].paid = true;
        users[idx].pending = false;
        users[idx].transactionId = txId; // On stocke l'ID
        users[idx].paymentDate = nowISO();
        users[idx].expiresAt = addYearsISO(nowISO(), 1);
        saveUsers(users);
        refreshUser();
      } else {
        setIsVerifying(false);
        setVerifyError("Une erreur est survenue. Veuillez réessayer.");
      }
    }, 2500);
  };

  const isAccessValid = user.paid && user.expiresAt && new Date(user.expiresAt) > new Date();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bonjour, {user.email}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isAccessValid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {isAccessValid 
              ? `Accès actif jusqu'au ${new Date(user.expiresAt!).toLocaleDateString()}` 
              : 'Compte gratuit (accès limité)'}
          </p>
        </div>
        {!isAccessValid && (
           <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">Paiement requis</span>
        )}
      </div>

      {/* Payment Section */}
      {!isAccessValid && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4 text-teal-300">
                <ShieldCheck size={24} />
                <span className="font-semibold tracking-wide uppercase text-sm">Abonnement Premium</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Débloquez l'intégralité pour 500 F</h2>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                1. Cliquez sur "Composer le code" pour payer via Mobile Money.<br/>
                2. Vous recevrez un SMS avec un <strong>ID de Transaction</strong>.<br/>
                3. Entrez cet ID dans le formulaire pour activer votre compte.
              </p>

              <a 
                href={USSD_TEL}
                className="bg-teal-500 hover:bg-teal-400 text-white w-full px-6 py-4 rounded-xl font-bold shadow-lg shadow-teal-900/50 flex items-center justify-center gap-3 transition-transform active:scale-95 mb-3"
              >
                <Phone size={20} />
                1. Composer le code
              </a>
              <p className="text-xs text-slate-500 text-center">Si le bouton ne marche pas, composez le {MOMO}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                2. Valider le paiement
              </h3>
              
              <form onSubmit={handleVerifyPayment} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 uppercase">ID de Transaction (Reçu par SMS)</label>
                  <input 
                    type="text" 
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="Ex: 17283904..."
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
                  />
                </div>

                {verifyError && (
                  <div className="text-rose-400 text-xs flex items-center gap-1 bg-rose-900/20 p-2 rounded">
                    <AlertCircle size={12} />
                    {verifyError}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-70 disabled:cursor-wait font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Activer mon compte"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-teal-600" />
          Modules de révision
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {getChapters().map(ch => {
            // Determine QCM count based on static arrays
            let count = 0;
            const titleLower = ch.title.toLowerCase();
            if (titleLower.includes('glucides')) count = GLUCIDES_QCMS.length;
            else if (titleLower.includes('lipides')) count = LIPIDES_QCMS.length;
            else if (titleLower.includes('acides amin')) count = AMINO_QCMS.length;
            else if (titleLower.includes('nucl')) count = NUCLEIC_QCMS.length;
            else count = ch.qcms.length;

            return (
              <div key={ch.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                <div>
                  <h4 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{ch.title}</h4>
                  <span className="text-sm text-slate-400">{count} Questions à choix multiples</span>
                </div>
                <button 
                  onClick={() => onViewChapter(ch.id)}
                  className="bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Ouvrir
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 4. QCM Card (moved up to fix TDZ and typed to fix props)
const QCMCard: React.FC<{ item: QCMItem, idx: number, userId: string, chapterKey: string, onAnswer: () => void }> = ({ item, idx, userId, chapterKey, onAnswer }) => {
  const responses = getChapterResponses(userId, chapterKey);
  const saved = responses[idx];
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (saved?.selected) setSelected(saved.selected);
  }, [saved]);

  const handleToggle = (letter: string) => {
    if (saved) return; // Locked
    if (selected.includes(letter)) setSelected(selected.filter(l => l !== letter));
    else setSelected([...selected, letter]);
  };

  const handleSubmit = () => {
    if (saved) return;
    
    // Scoring Logic from original code
    const correct = item.c; // ["A", "B"]
    const nbSelectedCorrect = selected.filter(s => correct.includes(s)).length;
    const nbSelectedWrong = selected.filter(s => !correct.includes(s)).length;
    
    let score = 0;
    let goodTexts = undefined;

    // Strict scoring: All correct must be selected, no wrong ones, for +5. Else -5.
    if (selected.length === 0) {
      score = -5;
    } else if (nbSelectedCorrect === correct.length && nbSelectedWrong === 0 && selected.length === correct.length) {
      score = 5;
    } else {
      score = -5;
      // Generate the text for correct answers to display
      const goodChoices = item.r
        .map((txt, i) => ({ letter: String.fromCharCode(65 + i), txt }))
        .filter(obj => correct.includes(obj.letter))
        .map(obj => obj.txt);
      goodTexts = goodChoices.join(", ");
    }

    saveUserResponse(userId, chapterKey, idx, { selected, score, goodTexts });
    onAnswer();
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${saved ? (saved.score > 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30') : 'border-slate-100'}`}>
      <h3 className="font-semibold text-slate-900 text-lg mb-4">
        <span className="text-slate-400 mr-2">#{idx + 1}</span>
        {item.q}
      </h3>

      <div className="space-y-3 mb-6">
        {item.r.map((rText, i) => {
          const letter = String.fromCharCode(65 + i);
          const isSelected = selected.includes(letter);
          const isRealAnswer = saved && item.c.includes(letter); // For visual feedback after answer
          
          return (
            <div 
              key={letter}
              onClick={() => handleToggle(letter)}
              className={`
                relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${!saved && isSelected ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-slate-200 hover:border-slate-300'}
                ${saved ? 'cursor-default' : ''}
                ${saved && isSelected ? 'bg-slate-100 border-slate-300 text-slate-600' : ''}
              `}
            >
              <div className={`
                w-5 h-5 rounded flex items-center justify-center border mt-0.5 text-xs font-bold shrink-0
                ${isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-300 text-slate-500'}
                ${saved && isSelected ? 'opacity-50' : ''}
              `}>
                {letter}
              </div>
              <span className={`text-sm ${saved && isRealAnswer ? 'font-bold text-emerald-700' : 'text-slate-700'}`}>
                {rText}
              </span>
              {saved && isRealAnswer && <CheckCircle size={16} className="absolute right-3 top-3 text-emerald-500" />}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between min-h-[40px]">
        {saved ? (
          <div className={`flex items-center gap-2 text-sm font-bold ${saved.score > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {saved.score > 0 ? <CheckCircle size={18}/> : <XCircle size={18}/>}
            <span>{saved.score > 0 ? 'Bonne réponse ! (+5)' : 'Mauvaise réponse (-5)'}</span>
          </div>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Valider
          </button>
        )}
      </div>
      
      {saved && saved.score < 0 && saved.goodTexts && (
        <div className="mt-3 text-xs text-rose-700 bg-rose-100 p-2 rounded">
          <strong>Bonnes réponses :</strong> {saved.goodTexts}
        </div>
      )}
    </div>
  );
};

// 5. QCM/Chapter View
const ChapterView = ({ user, chapterId, onBack }: { user: User, chapterId: string, onBack: () => void }) => {
  const [activeQIndex, setActiveQIndex] = useState(0); // Optional: scroll to specific, but list view is standard
  const chapters = getChapters();
  const chapter = chapters.find(c => c.id === chapterId);
  const isAccessValid = user.paid && user.expiresAt && new Date(user.expiresAt) > new Date();

  if (!chapter) return <div>Chapitre introuvable</div>;

  // Resolve QCM data
  let qcms: QCMItem[] = [];
  let chapterKey = '';
  const titleLower = chapter.title.toLowerCase();
  
  if (titleLower.includes('glucides')) { qcms = GLUCIDES_QCMS; chapterKey = 'glucides'; }
  else if (titleLower.includes('lipides')) { qcms = LIPIDES_QCMS; chapterKey = 'lipides'; }
  else if (titleLower.includes('acides amin')) { qcms = AMINO_QCMS; chapterKey = 'acides-aminés'; }
  else if (titleLower.includes('nucl')) { qcms = NUCLEIC_QCMS; chapterKey = 'acides-nucleiques'; }
  else { qcms = chapter.qcms; chapterKey = chapter.title.trim().toLowerCase(); }

  // State to force re-render when answers change
  const [refresh, setRefresh] = useState(0); 

  if (!isAccessValid) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-50 text-rose-800 p-8 rounded-2xl mb-6">
          <AlertCircle size={48} className="mx-auto mb-4 text-rose-500" />
          <h2 className="text-xl font-bold mb-2">Accès restreint</h2>
          <p>Vous devez souscrire à l'abonnement de 500 F pour accéder au chapitre <strong>{chapter.title}</strong>.</p>
        </div>
        <button onClick={onBack} className="text-slate-600 underline hover:text-slate-900">Retour au tableau de bord</button>
      </div>
    );
  }

  // Calculate Total Score
  const responses = getChapterResponses(user.id, chapterKey);
  const totalScore = Object.values(responses).reduce((acc, curr) => acc + curr.score, 0);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <LogOut size={20} className="rotate-180 text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{chapter.title}</h1>
          <p className="text-slate-500 text-sm">{qcms.length} QCM — Score actuel : <span className={`font-bold ${totalScore >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>{totalScore} pts</span></p>
        </div>
      </div>

      <div className="space-y-6">
        {qcms.map((q, idx) => (
          <QCMCard 
            key={idx} 
            item={q} 
            idx={idx} 
            userId={user.id} 
            chapterKey={chapterKey}
            onAnswer={() => setRefresh(prev => prev + 1)}
          />
        ))}
      </div>
    </div>
  );
};


// 5. Home
const Home = ({ onNavigate }: { onNavigate: (v: ViewState) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 max-w-4xl mx-auto">
    <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold border border-teal-100">
      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
      Nouveau : Session 2024
    </div>
    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
      Maîtrisez la <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">Biochimie</span>
    </h1>
    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
      La plateforme de référence pour les étudiants en santé. Révisez Glucides, Lipides, AA et Acides Nucléiques avec des QCM corrigés et détaillés.
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <button 
        onClick={() => onNavigate('register')}
        className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/20"
      >
        Commencer maintenant
      </button>
      <button 
        onClick={() => onNavigate('login')}
        className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors"
      >
        J'ai déjà un compte
      </button>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 text-center w-full">
      {[
        { val: "500 F", label: "Accès annuel" },
        { val: "400+", label: "Questions" },
        { val: "100%", label: "Correction auto" },
        { val: "24/7", label: "Accessible" }
      ].map((s, i) => (
        <div key={i}>
          <div className="text-3xl font-black text-slate-800">{s.val}</div>
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wide mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
);


// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  useEffect(() => {
    // Initial Auth Check
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setView('dashboard'); // Auto redirect if logged in
    }
  }, []);

  const handleAuthSuccess = (uid: string) => {
    setAuthId(uid);
    const u = getCurrentUser();
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    setAuthId(null);
    setUser(null);
    setView('home');
  };

  const refreshUser = () => {
    const u = getCurrentUser();
    setUser(u);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Header user={user} onLogout={handleLogout} onNavigate={setView} />
      
      <main className="animate-in fade-in duration-500">
        {view === 'home' && <Home onNavigate={setView} />}
        {view === 'login' && <Auth type="login" onAuthSuccess={handleAuthSuccess} onBack={() => setView('home')} />}
        {view === 'register' && <Auth type="register" onAuthSuccess={handleAuthSuccess} onBack={() => setView('home')} />}
        {view === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            refreshUser={refreshUser}
            onViewChapter={(cid) => { setActiveChapterId(cid); setView('chapter'); }} 
          />
        )}
        {view === 'chapter' && user && activeChapterId && (
          <ChapterView 
            user={user} 
            chapterId={activeChapterId} 
            onBack={() => setView('dashboard')} 
          />
        )}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 mt-auto bg-white">
        <p>© {new Date().getFullYear()} QCM Biochimie Pro — Tous droits réservés.</p>
      </footer>
    </div>
  );
}