
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  password: 'password',
  name: 'name',
  role: 'role',
  isVerified: 'isVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  gender: 'gender',
  imageId: 'imageId',
  location: 'location',
  coverPhotoId: 'coverPhotoId',
  profession: 'profession',
  description: 'description',
  experience: 'experience',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  bookingId: 'bookingId'
};

exports.Prisma.VenueScalarFieldEnum = {
  id: 'id',
  profileId: 'profileId',
  name: 'name',
  city: 'city',
  area: 'area',
  description: 'description',
  capacity: 'capacity',
  bookedDates: 'bookedDates',
  type: 'type',
  cateringDescription: 'cateringDescription',
  parkingDescription: 'parkingDescription',
  availabilityDescription: 'availabilityDescription',
  extraServiceDescription: 'extraServiceDescription',
  price: 'price',
  bookingType: 'bookingType',
  verified: 'verified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  venueId: 'venueId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShiftScalarFieldEnum = {
  id: 'id',
  venueId: 'venueId',
  startTime: 'startTime',
  endTime: 'endTime',
  duration: 'duration',
  shiftName: 'shiftName',
  employeeId: 'employeeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingScalarFieldEnum = {
  id: 'id',
  bookedById: 'bookedById',
  venueId: 'venueId',
  serviceProviderId: 'serviceProviderId',
  eventName: 'eventName',
  location: 'location',
  plannerName: 'plannerName',
  selectedDate: 'selectedDate',
  startTime: 'startTime',
  endTime: 'endTime',
  duration: 'duration',
  bookingType: 'bookingType',
  guestNumber: 'guestNumber',
  decoration: 'decoration',
  services: 'services',
  totalCost: 'totalCost',
  bookingStatus: 'bookingStatus',
  totalAmount: 'totalAmount',
  paid: 'paid',
  due: 'due',
  accept: 'accept',
  isEventFinished: 'isEventFinished',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  paymentStatus: 'paymentStatus',
  paymentMethod: 'paymentMethod',
  amount: 'amount',
  transactionId: 'transactionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DecorationScalarFieldEnum = {
  id: 'id',
  venueId: 'venueId',
  tableShapes: 'tableShapes',
  seatingStyles: 'seatingStyles',
  lighting: 'lighting',
  flowerColors: 'flowerColors',
  flowerTypes: 'flowerTypes',
  fragrances: 'fragrances'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  venueId: 'venueId',
  rating: 'rating',
  comment: 'comment',
  createdAt: 'createdAt',
  profileId: 'profileId'
};

exports.Prisma.AmenitiesScalarFieldEnum = {
  id: 'id',
  name: 'name',
  default: 'default'
};

exports.Prisma.FileInstanceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  fileId: 'fileId',
  path: 'path',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  bucket: 'bucket',
  type: 'type',
  venueId: 'venueId',
  eventPreferenceId: 'eventPreferenceId',
  profileId: 'profileId',
  directMessageId: 'directMessageId'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  memberOneId: 'memberOneId',
  memberTwoId: 'memberTwoId'
};

exports.Prisma.DirectMessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  memberId: 'memberId',
  conversationId: 'conversationId',
  deleted: 'deleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  PLANNER: 'PLANNER',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  VENUE_OWNER: 'VENUE_OWNER',
  GUEST: 'GUEST'
};

exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

exports.VenueType = exports.$Enums.VenueType = {
  HOTEL: 'HOTEL',
  RESTAURANT: 'RESTAURANT',
  CONFERENCE_HALL: 'CONFERENCE_HALL',
  BANQUET: 'BANQUET',
  RESORT: 'RESORT',
  OUTDOOR: 'OUTDOOR'
};

exports.BookingType = exports.$Enums.BookingType = {
  INSTANT_BOOKING: 'INSTANT_BOOKING',
  REQUEST_BASED_BOOKING: 'REQUEST_BASED_BOOKING'
};

exports.BookingStatus = exports.$Enums.BookingStatus = {
  REQUESTED: 'REQUESTED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED'
};

exports.AcceptanceStatus = exports.$Enums.AcceptanceStatus = {
  ACCEPTED: 'ACCEPTED',
  DENIED: 'DENIED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  PAYPAL: 'PAYPAL',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH'
};

exports.TableShape = exports.$Enums.TableShape = {
  ROUND: 'ROUND',
  OVAL: 'OVAL',
  HALF_MOON: 'HALF_MOON',
  BANQUET: 'BANQUET',
  SQUARE: 'SQUARE',
  HEXAGONAL: 'HEXAGONAL'
};

exports.SeatingStyle = exports.$Enums.SeatingStyle = {
  BANQUET: 'BANQUET',
  THEATER: 'THEATER',
  CLASSROOM: 'CLASSROOM',
  CABARET: 'CABARET',
  U_SHAPED: 'U_SHAPED',
  COCKTAIL: 'COCKTAIL'
};

exports.LightingStyle = exports.$Enums.LightingStyle = {
  AMBIENT: 'AMBIENT',
  SPOTLIGHTING: 'SPOTLIGHTING',
  FAIRY: 'FAIRY',
  CHANDELIERS: 'CHANDELIERS',
  LED: 'LED',
  NEON: 'NEON',
  GOBO: 'GOBO'
};

exports.FlowerColor = exports.$Enums.FlowerColor = {
  WHITE: 'WHITE',
  RED: 'RED',
  YELLOW: 'YELLOW',
  PINK: 'PINK',
  PURPLE: 'PURPLE',
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  ORANGE: 'ORANGE'
};

exports.FlowerType = exports.$Enums.FlowerType = {
  ROSES: 'ROSES',
  PEONIES: 'PEONIES',
  LILIES: 'LILIES',
  ORCHIDS: 'ORCHIDS',
  TULIPS: 'TULIPS',
  SUNFLOWERS: 'SUNFLOWERS',
  HYDRANGEAS: 'HYDRANGEAS'
};

exports.Fragrance = exports.$Enums.Fragrance = {
  FLORAL_SCENTS: 'FLORAL_SCENTS',
  CITRUS_SCENTS: 'CITRUS_SCENTS',
  HERBAL_SCENTS: 'HERBAL_SCENTS',
  OCEANIC_SCENTS: 'OCEANIC_SCENTS',
  WOODY_SCENTS: 'WOODY_SCENTS',
  SPICY: 'SPICY'
};

exports.FileType = exports.$Enums.FileType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT'
};

exports.Prisma.ModelName = {
  User: 'User',
  Profile: 'Profile',
  EventType: 'EventType',
  Venue: 'Venue',
  Employee: 'Employee',
  Shift: 'Shift',
  Booking: 'Booking',
  Payment: 'Payment',
  Decoration: 'Decoration',
  Review: 'Review',
  Amenities: 'Amenities',
  FileInstance: 'FileInstance',
  Conversation: 'Conversation',
  DirectMessage: 'DirectMessage'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
