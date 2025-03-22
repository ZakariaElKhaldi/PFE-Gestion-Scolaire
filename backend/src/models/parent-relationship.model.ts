import mongoose, { Schema, Document } from 'mongoose';
import { nanoid } from 'nanoid';

// Enum for relationship type
export enum RelationshipType {
  PARENT = 'parent',
  GUARDIAN = 'guardian',
  OTHER = 'other'
}

// Enum for relationship status
export enum RelationshipStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Interface for ParentRelationship document
export interface IParentRelationship extends Document {
  parentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  relationshipType: RelationshipType;
  description: string;
  status: RelationshipStatus;
  verificationToken: string;
  tokenExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for ParentRelationship
const ParentRelationshipSchema: Schema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationshipType: {
    type: String,
    enum: Object.values(RelationshipType),
    default: RelationshipType.PARENT,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: Object.values(RelationshipStatus),
    default: RelationshipStatus.PENDING,
    required: true
  },
  verificationToken: {
    type: String,
    default: () => nanoid(32),
    unique: true
  },
  tokenExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create and export the model
export const ParentRelationshipModel = mongoose.model<IParentRelationship>('ParentRelationship', ParentRelationshipSchema); 