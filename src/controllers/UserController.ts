import { request, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { hash } from 'bcryptjs';
import UserRepository from '../repositories/UserRepository';
import RoleRepository from '../repositories/RoleRepository';
import { decode } from 'jsonwebtoken';

class UserController {

  async create(request: Request, response: Response) {
    const userRepository = getCustomRepository(UserRepository);
    const roleRepository = getCustomRepository(RoleRepository);

    const { name, username, password, roles } = request.body;

    const existUser = await userRepository.findOne({ username });

    if (existUser) {
      return response.status(400).json({ error: 'User already exists!' });
    }

    const passwordHashed = await hash(password, 8);

    const existsRoles = await roleRepository.findByIds(roles);

    const user = userRepository.create({
      name,
      username,
      password: passwordHashed,
      roles: existsRoles
    });

    await userRepository.save(user);

    delete user.password;

    return response.status(201).json(user);
  }

  async roles(request: Request, response: Response) {
    const authHeader = request.headers.authorization || "";
    
    const userRepository = getCustomRepository(UserRepository);

    const [, token] = authHeader?.split(" ");

    try {
      if (!token) {
        return response.status(401).json({ error: "Not authorized!" });
      }

      const payload: any = decode(token);

      if (!payload) {
        return response.status(401).json({ error: "Not authorized!" });
      }

      const user = await userRepository.findOne(payload?.sub, {
        relations: ["roles"],
      });

      const roles = user?.roles.map((r) => r.name);

      return response.json(roles);
    } catch (err) {
      return response.status(400).send();
    }
  }
}

export default new UserController();