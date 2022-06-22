const graphql = require("graphql");
var _ = require("lodash");

// import mongodbschema
const User = require("../models/user");
const Hobby = require("../models/hobby");
const Post = require("../models/post");

const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLInt,
	GraphQLList,
	GraphQLSchema,
	GraphQLNonNull,
} = graphql;

// Dummy Data
// var usersData = [
//   { id: "1", name: "Bond", age: 36, profession: "Programmer" },
//   { id: "13", name: "Anna", age: 26, profession: "Baker" },
//   { id: "211", name: "Bella", age: 16, profession: "Mechanic" },
//   { id: "19", name: "Gina", age: 26, profession: "Painter" },
//   { id: "150", name: "Georgina", age: 36, profession: "Teacher" },
// ];

// var hobbiesData = [
//   {
//     id: "1",
//     title: "Programming",
//     description: "Using computers to make the world a better place",
//     userId: "150",
//   },
//   {
//     id: "2",
//     title: "Rowing",
//     description: "Sweat and feel better before eating donouts",
//     userId: "211",
//   },
//   {
//     id: "3",
//     title: "Swimming",
//     description: "Get in the water and learn to become the water",
//     userId: "211",
//   },
//   {
//     id: "4",
//     title: "Fencing",
//     description: "A hobby for fency people",
//     userId: "13",
//   },
//   {
//     id: "5",
//     title: "Hiking",
//     description: "Wear hiking boots and explore the world",
//     userId: "150",
//   },
// ];

// var postsData = [
//   { id: "1", comment: "Building a Mind", userId: "1" },
//   { id: "2", comment: "GraphQL is Amazing", userId: "1" },
//   { id: "3", comment: "How to Change the World", userId: "19" },
//   { id: "4", comment: "How to Change the World", userId: "211" },
//   { id: "5", comment: "How to Change the World", userId: "1" },
// ];

//UserTypes

const UserType = new GraphQLObjectType({
	name: "User",
	description: "Documentation for user",
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		age: { type: GraphQLInt },
		profession: { type: GraphQLString },

		// get all the post that belongs to the UserID
		posts: {
			type: new GraphQLList(PostType),
			resolve(parent, args) {
				//return _.filter(postsData, { userId: parent.id });
				return Post.find({ userId: parent.id });
			},
		},
		// get all the hobbies that belongs to the userID
		hobbies: {
			type: new GraphQLList(HobbyType),
			resolve(parent, args) {
				//return _.filter(hobbiesData, { userId: parent.id });
				return Hobby.find({ userId: parent.id });
			},
		},
	}),
});

//HobbyType
const HobbyType = new GraphQLObjectType({
	name: "Hobby",
	description: "Documentation for hobby",
	fields: () => ({
		id: { type: GraphQLID },
		title: { type: GraphQLString },
		description: { type: GraphQLString },
		user: {
			type: UserType,
			resolve(parent, args) {
				return User.findById(parent.userId);
			},
		},
	}),
});

// postData TYpes
const PostType = new GraphQLObjectType({
	name: "Posts",
	description: " Documentation for Posts",
	fields: () => ({
		id: { type: GraphQLID },
		comment: { type: GraphQLString },
		//userId: { type: GraphQLString },
		user: {
			type: UserType,
			resolve(parent, args) {
				return User.findById(parent.userId);
			},
		},
	}),
});

// Root query
const RootQuery = new GraphQLObjectType({
	name: "RootQueryType",
	description: "Description",
	fields: {
		// Root query for one usertype
		user: {
			type: UserType,
			args: {
				id: { type: GraphQLID },
			},
			resolve(parent, args) {
				return User.findById(args.id);
			},
		},
		//  Root query for  one hobby type
		hobby: {
			type: HobbyType,
			args: {
				id: { type: GraphQLID },
			},
			resolve(parent, args) {
				return Hobby.findById(args.id);
			},
		},
		// root query for  one post
		post: {
			type: PostType,
			args: {
				id: { type: GraphQLID },
			},
			resolve(parent, args) {
				return Post.findById(args.id);
			},
		},

		// Get all the users
		users: {
			type: new GraphQLList(UserType),
			resolve(parent, args) {
				return User.find({});
			},
		},

		// get all the hobbies
		hobbies: {
			type: new GraphQLList(HobbyType),
			resolve(parents, args) {
				return Hobby.find({});
			},
		},

		// get all posts
		posts: {
			type: new GraphQLList(PostType),
			resolve(parents, args) {
				return Post.find({});
			},
		},
	},
});

//Mutations
const Mutation = new GraphQLObjectType({
	name: "Mutation",
	fields: {
		// create User
		CreateUser: {
			type: UserType,
			args: {
				//id: { type: GraphQLID },
				name: { type: GraphQLNonNull(GraphQLString) },
				age: { type: GraphQLNonNull(GraphQLInt) },
				profession: { type: GraphQLString },
			},
			resolve(parent, args) {
				let user = User({
					name: args.name,
					age: args.age,
					profession: args.profession,
				});
				return user.save();
			},
		},

		// update user
		UpdateUser: {
			type: UserType,
			args: {
				id: { type: GraphQLNonNull(GraphQLString) },
				name: { type: GraphQLNonNull(GraphQLString) },
				age: { type: GraphQLNonNull(GraphQLInt) },
				profession: { type: GraphQLString },
			},
			resolve(parent, args) {
				return (updateUser = User.findOneAndUpdate(
					args.id,
					{
						$set: {
							name: args.name,
							age: args.age,
							profession: args.profession,
						},
					},
					{ new: true } //sends back the updated object model
				));
			},
		},

		// delete user
		DeleteUser: {
			type: UserType,
			args: {
				id: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve(parent, args) {
				let removedUser = User.findByIdAndRemove(args.id).exec();
				if (!removedUser) {
					throw new Error();
				}
				return removedUser;
			},
		},

		//create post
		CreatePost: {
			type: PostType,
			args: {
				//id: { type: GraphQLID },
				comment: { type: GraphQLNonNull(GraphQLString) },
				userId: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve(parent, args) {
				let post = Post({
					comment: args.comment,
					userId: args.userId,
				});
				return post.save();
			},
		},

		//update post
		UpdatePost: {
			type: PostType,
			args: {
				id: { type: GraphQLNonNull(GraphQLString) },
				comment: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve(parent, args) {
				return (updatedPost = Post.findByIdAndUpdate(
					args.id,
					{
						$set: {
							comment: args.comment,
						},
					},
					{ new: true } //sends back the updated object model
				));
			},
		},

		//Delete post
		DeletePost: {
			type: PostType,
			args: {
				id: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve(parent, args) {
				let deletedPost = Post.findByIdAndRemove(args.id).exec();
				if (!deletedPost) {
					throw new Error();
				}
				return deletedPost;
			},
		},

		//Create Hobby Mutation
		CreateHobby: {
			type: HobbyType,
			args: {
				//id: { type: GraphQLID },
				title: { type: GraphQLNonNull(GraphQLString) },
				description: { type: GraphQLNonNull(GraphQLString) },
				userId: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve(parent, args) {
				let hobby = Hobby({
					title: args.title,
					description: args.description,
					userId: args.userId,
				});
				return hobby.save();
			},
		},

		// update hobby
		UpdateHobby: {
			type: HobbyType,
			args: {
				id: { type: GraphQLNonNull(GraphQLString) },
				title: { type: GraphQLNonNull(GraphQLString) },
				description: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve(parents, args) {
				return (updatedHobby = Hobby.findByIdAndUpdate(
					args.id,
					{
						$set: {
							title: args.title,
							description: args.description,
						},
					},
					{ new: true }
				));
			},
		},

		//Delete Hobby
		DeleteHobby: {
			type: HobbyType,
			args: {
				id: { type: GraphQLNonNull(GraphQLString) },
			},
			resolve(parent, args) {
				let deletedHobby = Hobby.findByIdAndRemove(args.id).exec();
				if (!deletedHobby) {
					throw new Error();
				}
				return deletedHobby;
			},
		},
	},
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation,
});
