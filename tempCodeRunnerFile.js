app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));