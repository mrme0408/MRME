
// Core client-side behavior for MR LEON package
(function(){
  // Theme toggle
  function setTheme(isLight){
    if(isLight) document.body.classList.add('theme-light'); else document.body.classList.remove('theme-light');
    localStorage.setItem('ml_theme_light', !!isLight);
  }
  document.getElementById('themeToggle')?.addEventListener('click', ()=>{
    const isLight = !document.body.classList.contains('theme-light');
    setTheme(isLight);
  });
  document.getElementById('themeToggleDash')?.addEventListener('click', ()=>{
    const isLight = !document.body.classList.contains('theme-light');
    setTheme(isLight);
  });

  // Initialize theme
  if(localStorage.getItem('ml_theme_light')==='true') setTheme(true);

  // Simple auth (client-side) for demo — replace with Firebase Auth for production
  function currentUser(){ return JSON.parse(localStorage.getItem('ml_current_user')||'null'); }
  function saveUser(u){ localStorage.setItem('ml_current_user', JSON.stringify(u)); }
  function clearUser(){ localStorage.removeItem('ml_current_user'); }

  // Hook sign in (index.html simple flow)
  document.getElementById('openSign')?.addEventListener('click', ()=> location.href='dashboard.html');

  // Example: on dashboard load populate profile
  if(location.pathname.endsWith('dashboard.html')){
    const u = currentUser();
    if(!u){
      // if not logged in, create demo user for convenience
      const demo = {id:'demo',name:'Demo User',email:'demo@local',username:'demo',subs:null,txns:[]};
      saveUser(demo);
      fillProfile(demo);
    } else fillProfile(u);
    // load txns
    renderTxns();
  }

  if(location.pathname.endsWith('admin.html')){
    // simple protection: require 'admin=true' flag; in production use secure auth
    const isAdmin = localStorage.getItem('ml_is_admin')==='true';
    const adminContent = document.getElementById('adminContent');
    if(!isAdmin){ adminContent.innerHTML = '<p><i>Not signed in as admin.</i></p><p>To simulate admin: open console and run localStorage.setItem("ml_is_admin","true") then refresh.</p>'; }
    else { adminContent.innerHTML = '<p><b>Admin access granted.</b> List of users & transactions would appear here (server-side in production).</p>'; }
  }

  // profile helpers
  function fillProfile(u){
    document.getElementById('p_name').textContent = u.name;
    document.getElementById('p_email').textContent = u.email;
    document.getElementById('p_user').textContent = u.username;
  }

  // Payment sample: opens Razorpay (client-side). In production create orders server-side and verify webhook.
  window.startPaymentSample = function(amountPaise, plan){
    const u = currentUser();
    if(!u){ alert('Please sign in or use dashboard'); return; }
    const key = 'rzp_test_your_key_here';
    const options = {
      key: key,
      amount: amountPaise,
      currency: 'INR',
      name: 'MR LEON OFFICIAL',
      description: plan + ' plan',
      prefill: { name: u.name, email: u.email },
      handler: function(response){
        // On success, save transaction locally and mark subscription
        const tx = {id:'tx_'+Math.random().toString(36).slice(2,8), when:new Date().toISOString(), item:plan, amountPaise, status:'paid', paymentId: response.razorpay_payment_id};
        const stored = JSON.parse(localStorage.getItem('ml_txns')||'[]'); stored.unshift(tx); localStorage.setItem('ml_txns', JSON.stringify(stored));
        // update user
        u.subs = plan;
        saveUser(u);
        alert('Payment success: '+response.razorpay_payment_id);
        location.href='payment-success.html';
      }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  };

  // Transactions rendering
  function renderTxns(){
    const list = JSON.parse(localStorage.getItem('ml_txns')||'[]');
    const container = document.getElementById('txnList');
    if(!container) return;
    if(list.length===0) container.innerHTML = '<p class="muted">No transactions yet.</p>';
    else {
      container.innerHTML = '<ul>'+list.map(t=>'<li>'+ (new Date(t.when)).toLocaleString() +' — '+ t.item +' — ₹'+(t.amountPaise/100).toFixed(2) + ' — ' + t.status +'</li>').join('') + '</ul>';
    }
  }

  // Email verification simulate
  window.completeVerification = function(){
    const em = document.getElementById('verifyEmail').textContent || 'you@example.com';
    alert('Email '+em+' verified (simulated). You can now sign in.');
    location.href='dashboard.html';
  }

  // Logout
  window.logout = function(){
    clearUser();
    localStorage.removeItem('ml_txns');
    location.href='index.html';
  }

})();