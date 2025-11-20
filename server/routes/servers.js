const express = require('express');
const Server = require('../models/Server');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Criar servidor
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nome do servidor é obrigatório' });
    }

    // Criar servidor
    const server = new Server({
      name: name.trim(),
      description: description?.trim() || '',
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner'
      }],
      channels: [
        {
          name: 'geral',
          type: 'text',
          position: 0
        },
        {
          name: 'Voz Geral',
          type: 'voice',
          position: 1
        }
      ]
    });

    await server.save();

    // Adicionar servidor ao usuário
    await User.findByIdAndUpdate(req.user._id, {
      $push: { servers: server._id }
    });

    res.status(201).json({ server });
  } catch (error) {
    console.error('Erro ao criar servidor:', error);
    res.status(500).json({ error: 'Erro ao criar servidor' });
  }
});

// Listar servidores do usuário
router.get('/my-servers', auth, async (req, res) => {
  try {
    const servers = await Server.find({
      'members.user': req.user._id
    })
      .populate('owner', 'username avatar')
      .populate('members.user', 'username avatar status')
      .sort({ createdAt: -1 });

    res.json({ servers });
  } catch (error) {
    console.error('Erro ao buscar servidores:', error);
    res.status(500).json({ error: 'Erro ao buscar servidores' });
  }
});

// Buscar servidor por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members.user', 'username avatar status')
      .populate('channels.voiceSettings.allowedUsers', 'username avatar');

    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Verificar se usuário é membro
    const isMember = server.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Você não é membro deste servidor' });
    }

    res.json({ server });
  } catch (error) {
    console.error('Erro ao buscar servidor:', error);
    res.status(500).json({ error: 'Erro ao buscar servidor' });
  }
});

// Atualizar servidor
router.put('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Verificar se é owner ou admin
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const { name, description, icon } = req.body;
    if (name) server.name = name.trim();
    if (description !== undefined) server.description = description.trim();
    if (icon !== undefined) server.icon = icon;

    await server.save();
    res.json({ server });
  } catch (error) {
    console.error('Erro ao atualizar servidor:', error);
    res.status(500).json({ error: 'Erro ao atualizar servidor' });
  }
});

// Deletar servidor
router.delete('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Apenas owner pode deletar
    if (server.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Apenas o dono pode deletar o servidor' });
    }

    // Remover servidor dos usuários
    await User.updateMany(
      { servers: server._id },
      { $pull: { servers: server._id } }
    );

    await Server.findByIdAndDelete(req.params.id);
    res.json({ message: 'Servidor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar servidor:', error);
    res.status(500).json({ error: 'Erro ao deletar servidor' });
  }
});

// Adicionar membro ao servidor
router.post('/:id/members', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Verificar permissão
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const { userId } = req.body;
    await server.addMember(userId);
    
    // Adicionar servidor ao usuário
    await User.findByIdAndUpdate(userId, {
      $addToSet: { servers: server._id }
    });

    res.json({ message: 'Membro adicionado com sucesso', server });
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ error: 'Erro ao adicionar membro' });
  }
});

// Remover membro do servidor
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Verificar permissão
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await server.removeMember(req.params.userId);
    
    // Remover servidor do usuário
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { servers: server._id }
    });

    res.json({ message: 'Membro removido com sucesso', server });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

module.exports = router;

