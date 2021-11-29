import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

import UserRepository from '../repositories/UserRepository';

class SessionController {
  async create(request: Request, response: Response) {
    const { username, password } = request.body;

    const userRepository = getCustomRepository(UserRepository);

    const user = await userRepository.findOne({ username }, { relations: ['roles'] });

    if (!user) {
      return response.status(400).json({ error: 'User not found!' });
    }

    const matchPassword = await compare(password, user.password);

    if (!matchPassword) {
      return response.status(400).json({ error: 'Incorrect username or password!' });
    }

    const roles = user.roles.map(role => role.name);

    const token = sign({ roles }, "7f21739d1e7de099d65af563a38138e8", {
      subject: user.id,
      expiresIn: '1d'
    });

    return response.json({
      token,
      user
    });
  }
}

export default new SessionController();