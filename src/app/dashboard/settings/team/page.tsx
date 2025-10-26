'use client';

import { useOrganization } from '@clerk/nextjs';
import { useState } from 'react';
import { FiUserPlus, FiMail, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import type { OrganizationInvitationResource } from '@clerk/types';

export default function TeamPage() {
    const { organization, memberships, invitations, membership: currentUserMembership } = useOrganization({
        memberships: {
          infinite: true,
        },
        invitations: {
          infinite: true,
        },
      });
    
      const isAdmin = currentUserMembership?.role === 'org:admin';
      const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
      const [inviteEmail, setInviteEmail] = useState('');
      const [inviteRole, setInviteRole] = useState<'org:member' | 'org:admin'>('org:member');
      const [isSending, setIsSending] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setIsSending(true);
    try {
      await organization?.inviteMember({
        emailAddress: inviteEmail,
        role: inviteRole,
      });
      toast.success('Invitation sent!');
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await organization?.removeMember(userId);
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
      console.error(error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'org:member' | 'org:admin') => {
    try {
      await organization?.updateMember({
        userId,
        role: newRole,
      });
      toast.success('Role updated');
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    }
  };

  const handleRevokeInvitation = async (invitation: OrganizationInvitationResource) => {
    try {
      await invitation.revoke();
      toast.success('Invitation revoked');
    } catch (error) {
      toast.error('Failed to revoke invitation');
      console.error(error);
    }
  };

  const adminCount = memberships?.data?.filter(m => m.role === 'org:admin').length || 0;

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your team and invite new members
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <FiUserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Active Members ({memberships?.count || 0})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {memberships?.data?.map((membership) => {
            const userData = membership.publicUserData;
            if (!userData) return null;

            const displayName = userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : userData.identifier || 'Unknown User';
            
            const initial = userData.firstName?.[0] || userData.identifier?.[0] || 'U';

            return (
              <div key={membership.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-medium">
                    {initial}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-600">{userData.identifier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={membership.role}
                    onChange={(e) => handleUpdateRole(userData.userId!, e.target.value as 'org:member' | 'org:admin')}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                    disabled={membership.role === 'org:admin' && adminCount === 1}
                  >
                    <option value="org:member">Member</option>
                    <option value="org:admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(userData.userId!)}
                    disabled={membership.role === 'org:admin' && adminCount === 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove member"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {invitations?.data && invitations.data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Pending Invitations ({invitations.count})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {invitations.data.map((invitation) => (
              <div key={invitation.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiMail className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invitation.emailAddress}</p>
                    <p className="text-sm text-gray-600">Invited • {invitation.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeInvitation(invitation)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'org:member' | 'org:admin')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                >
                  <option value="org:member">Member</option>
                  <option value="org:admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Admins can invite members and manage billing
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}