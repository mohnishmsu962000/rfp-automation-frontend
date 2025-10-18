'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import AddAttributeModal from '@/components/modals/AddAttributeModal';
import EditAttributeModal from '@/components/modals/EditAttributeModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { useAttributes } from '@/hooks/useAttributes';
import { FiTag, FiSearch, FiTrash2, FiLoader, FiEdit2, FiChevronDown } from 'react-icons/fi';
import { format } from 'date-fns';
import { Attribute } from '@/types/models';

const CATEGORY_COLORS: Record<Attribute['category'], string> = {
  technical: 'bg-blue-50 text-blue-700 border-blue-200',
  compliance: 'bg-green-50 text-green-700 border-green-200',
  business: 'bg-purple-50 text-purple-700 border-purple-200',
  product: 'bg-orange-50 text-orange-700 border-orange-200',
};

type SortOption = 'newest' | 'oldest' | 'name' | 'category';
type CategoryFilter = 'all' | Attribute['category'];

export default function AttributesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [deletingAttribute, setDeletingAttribute] = useState<Attribute | null>(null);

  const { data: attributes, isLoading } = useAttributes();

  const filteredAndSortedAttributes = useMemo(() => {
    if (!attributes) return [];
    
    const filtered = attributes.filter(attr => {
      const matchesSearch = 
        attr.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attr.value.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || attr.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        case 'oldest':
          return new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime();
        case 'name':
          return a.key.localeCompare(b.key);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [attributes, searchQuery, sortBy, categoryFilter]);

  const categoryCounts = useMemo(() => {
    if (!attributes) return { all: 0, technical: 0, compliance: 0, business: 0, product: 0 };
    return {
      all: attributes.length,
      technical: attributes.filter(a => a.category === 'technical').length,
      compliance: attributes.filter(a => a.category === 'compliance').length,
      business: attributes.filter(a => a.category === 'business').length,
      product: attributes.filter(a => a.category === 'product').length,
    };
  }, [attributes]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Attributes
            </h1>
            <p className="text-gray-600 mt-2">Manage company attributes and metadata</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-600 hover:to-brand-primary shadow-lg"
          >
            <FiTag className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer text-sm font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="category">Category</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors cursor-pointer text-sm font-medium"
              >
                <option value="all">All Categories ({categoryCounts.all})</option>
                <option value="technical">Technical ({categoryCounts.technical})</option>
                <option value="compliance">Compliance ({categoryCounts.compliance})</option>
                <option value="business">Business ({categoryCounts.business})</option>
                <option value="product">Product ({categoryCounts.product})</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12">
              <FiLoader className="h-8 w-8 text-brand-primary animate-spin" />
            </div>
          </Card>
        ) : filteredAndSortedAttributes.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<FiTag className="h-12 w-12" />}
              title={searchQuery || categoryFilter !== 'all' ? 'No attributes found' : 'No attributes yet'}
              description={
                searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add company attributes like founding year, employee count, certifications, etc.'
              }
              action={
                !searchQuery && categoryFilter === 'all' ? (
                  <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                    <FiTag className="mr-2 h-4 w-4" />
                    Add Attribute
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">Key</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/3">Value</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Category</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Last Updated</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedAttributes.map((attr) => (
                  <tr key={attr.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <FiTag className="h-5 w-5 text-brand-primary" />
                        </div>
                        <span className="font-semibold text-gray-900">{attr.key}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{attr.value}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${CATEGORY_COLORS[attr.category]}`}>
                        {attr.category.charAt(0).toUpperCase() + attr.category.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                      {attr.last_updated ? format(new Date(attr.last_updated), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setEditingAttribute(attr)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-600 hover:to-brand-primary rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          <FiEdit2 className="h-3 w-3" />
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeletingAttribute(attr)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <FiTrash2 className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddAttributeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingAttribute && (
        <EditAttributeModal 
          isOpen={true}
          onClose={() => setEditingAttribute(null)}
          attribute={editingAttribute}
        />
      )}

      {deletingAttribute && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingAttribute(null)}
          title="Delete Attribute"
          description={`Are you sure you want to delete the attribute "${deletingAttribute.key}"?`}
          itemId={deletingAttribute.id}
          endpoint="/api/attributes"
          queryKey="attributes"
          successMessage="Attribute deleted successfully"
        />
      )}
    </>
  );
}