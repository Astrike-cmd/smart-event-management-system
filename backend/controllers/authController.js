import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const getAuthPayload = (user) => ({
  success: true,
  message: 'Authentication successful.',
  token: generateToken(user._id, user.role),
  user: user.toSafeObject()
});

const validateRegistrationInput = ({ name, email, password, confirmPassword }) => {
  if (!name || !email || !password || !confirmPassword) {
    return 'All fields are required.';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long.';
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Please enter a valid email address.';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  if (password !== confirmPassword) {
    return 'Password and confirm password must match.';
  }

  return null;
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    return 'Email and password are required.';
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Please enter a valid email address.';
  }

  return null;
};

export const registerUser = async (req, res, next) => {
  try {
    const validationError = validateRegistrationInput(req.body);

    if (validationError) {
      res.status(400);
      next(new Error(validationError));
      return;
    }

    const email = req.body.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      next(new Error('An account with this email already exists.'));
      return;
    }

    const user = await User.create({
      name: req.body.name.trim(),
      email,
      password: req.body.password,
      role: 'user'
    });

    res.status(201).json({
      ...getAuthPayload(user),
      message: 'Registration successful.'
    });
  } catch (error) {
    next(error);
  }
};

const loginWithRole = async ({ email, password, allowedRole }) => {
  const user = await User.findOne({ email });

  if (!user) {
    return { error: 'Invalid email or password.', statusCode: 401 };
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    return { error: 'Invalid email or password.', statusCode: 401 };
  }

  if (allowedRole && user.role !== allowedRole) {
    return { error: `Only ${allowedRole} accounts can use this login page.`, statusCode: 403 };
  }

  return { user };
};

export const loginUser = async (req, res, next) => {
  try {
    const validationError = validateLoginInput(req.body);

    if (validationError) {
      res.status(400);
      next(new Error(validationError));
      return;
    }

    const email = req.body.email.toLowerCase().trim();
    const { user, error, statusCode } = await loginWithRole({
      email,
      password: req.body.password
    });

    if (error) {
      res.status(statusCode);
      next(new Error(error));
      return;
    }

    res.status(200).json(getAuthPayload(user));
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const validationError = validateLoginInput(req.body);

    if (validationError) {
      res.status(400);
      next(new Error(validationError));
      return;
    }

    const email = req.body.email.toLowerCase().trim();
    const { user, error, statusCode } = await loginWithRole({
      email,
      password: req.body.password,
      allowedRole: 'admin'
    });

    if (error) {
      res.status(statusCode);
      next(new Error(error));
      return;
    }

    res.status(200).json({
      ...getAuthPayload(user),
      message: 'Admin login successful.'
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
